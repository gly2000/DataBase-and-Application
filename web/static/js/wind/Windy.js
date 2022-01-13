//横向和纵向网格的数量
var x_grid=260;
var y_grid=160;
//经纬度范围
var east=73;
var west=135;
var south=18;
var north=54;
//记录缩放变换量,每次缩放或移动后更新
var global_transform=null;
var canvas_width=864;
var canvas_height=636;

//speed_u,speed_v插值得到网格风速
//data_grid记录每个格子内有哪些数据点
//available数组记录每个网格的四周是否都有数据点
//density记录网格浓度
var speed_u=new Array();
var speed_v=new Array();
var data_grid=new Array();
var available=new Array();
var pollution=new Array();
for(var i=0;i<y_grid;++i){
    speed_u[i]=new Array();
    speed_v[i]=new Array();
    available[i]=new Array();
    pollution[i]=new Array();
    for(var j=0;j<x_grid;++j){
        speed_u[i][j]=0;
        speed_v[i][j]=0;
        available[i][j]=false;
        pollution[i][j]=0;
    }
}
//259*159个cell
var Cell=function(){
    this.lons=new Array();  //记录点经度数值的数组，初始为空
    this.lats=new Array();  //记录点纬度数值的数组，初始为空
    this.u_speed=new Array();  //记录点纬向风速
    this.v_speed=new Array();  //记录点经向风速
    this.density=new Array();  //记录点污染物浓度(以PM2.5为例)
}
//创建cell
for(var i=0;i<y_grid-1;++i){
    data_grid[i]=new Array();
    for(var j=0;j<x_grid-1;++j){
        data_grid[i][j]=new Cell();
    }
}

function init_parameter(){
    for(var i=0;i<y_grid-1;++i){
        for(var j=0;j<x_grid-1;++j){
            data_grid[i][j]=new Cell();
        }
    }
    for(var i=0;i<y_grid;++i){
        for(var j=0;j<x_grid;++j){
            speed_u[i][j]=0;
            speed_v[i][j]=0;
            available[i][j]=false;
            pollution[i][j]=0;
        }
    }
}

function init_speed(data){
    init_parameter();
    //将数据点置入cell
    for(var i=0;i<data.length;++i){
        insert_cell(data[i]);
    }
    //每个网格点进行风速的插值。仅在网格点四个方向上的cell内都有数据点时才插值
    for(var i=1;i<y_grid-1;++i){
        for(var j=1;j<x_grid-1;++j){
            //四周都有数据点
            if(data_grid[i-1][j-1].lons.length>0 && data_grid[i][j-1].lons.length>0 && data_grid[i-1][j].lons.length>0 && data_grid[i][j].lons.length>0){
                available[i][j]=true;
                //分别取四个方向距离网格点最近的采样点(顺序：左下、右下、左上、右上)
                var coordinate_0,coordinate_1,coordinate_2,coordinate_3;
                var dx=(west-east)/(x_grid-1);
                var dy=(north-south)/(y_grid-1);
                var cx=east+j*dx;     //网格经度
                var cy=south+i*dy;    //网格纬度
                //返回值：经度、纬度、纬向风速、经向风速、污染物浓度
                coordinate_0=get_neighbour(cx,cy,i-1,j-1);
                coordinate_1=get_neighbour(cx,cy,i-1,j);
                coordinate_2=get_neighbour(cx,cy,i,j-1);
                coordinate_3=get_neighbour(cx,cy,i,j);
                //网格点，i和j用于记录插值结果
                coordinate_center=[cx,cy,i,j];
                //逆双线性插值，获取网格点的风速，填入数组u_speed和v_speed
                speed_interpolation(coordinate_0,coordinate_1,coordinate_2,coordinate_3,coordinate_center);
            }
        }
    }
}

function insert_cell(record){
    var dx=(west-east)/(x_grid-1);
    var dy=(north-south)/(y_grid-1);
    var x_index=Math.floor((record['lon']-east)/dx);
    var y_index=Math.floor((record['lat']-south)/dy);
    var cell=data_grid[y_index][x_index];
    cell.lons.push(record['lon']);
    cell.lats.push(record['lat']);
    cell.u_speed.push(record['U']);
    cell.v_speed.push(record['V']);
    cell.density.push(record.density_PM25);
    data_grid[y_index][x_index]=cell;
}

//得到距离网格点最近的采样点
function get_neighbour(cx,cy,vx,vy){
    var min_dist=100000;
    var id=-1;
    for(var i=0;i<data_grid[vx][vy].lons.length;++i){
        var distance=Math.sqrt(Math.pow(data_grid[vx][vy].lons[i]-cx,2)+Math.pow(data_grid[vx][vy].lats[i]-cy,2));
        if(distance<min_dist){
            min_dist=distance;
            id=i;
        }
    }
    var tmp_cell=data_grid[vx][vy];
    var coordinate=[tmp_cell.lons[id],tmp_cell.lats[id],tmp_cell.u_speed[id],tmp_cell.v_speed[id],tmp_cell.density[id]];
    return coordinate;
}

//逆双线性插值法，c为被插值计算的网格点 https://blog.csdn.net/lk040384/article/details/104939742
function speed_interpolation(c0,c1,c2,c3,c){
    var dx=(west-east)/(x_grid-1);
    var dy=(north-south)/(y_grid-1);
    //定义向量
    var Hx=c[0]-c2[0],Hy=c[1]-c2[1];
    var Ex=c3[0]-c2[0],Ey=c3[1]-c2[1];
    var Fx=c0[0]-c2[0],Fy=c0[1]-c2[1];
    var Gx=c1[0]+c2[0]-c0[0]-c3[0],Gy=c1[1]+c2[1]-c0[1]-c3[1];
    //计算中间量
    var k0=Hx*Ey-Hy*Ex;
    var k1=Ex*Fy-Ey*Fx+Hx*Gy-Hy*Gx;
    var k2=Gx*Fy-Gy*Fx;
    //计算u和v，避免k2为0(平行)，k2加1个极小值
    if(k2==0) k2=k2+1e-6;
    var tmp=Math.sqrt(k1*k1-4*k0*k2);
    var v1=(-k1+tmp)/(2*k2);
    var v2=(-k1-tmp)/(2*k2);
    var v;
    if(v1>=0 && v1<=1) v=v1;
    else v=v2;
    var u=(Hx-Fx*v)/(Ex+Gx*v);
    //计算插值的风速(Px代表P的纬向风速，Py代表P的经向风速，Pn表示污染物浓度，其它同)
    var Px=c2[2]+u*(c3[2]-c2[2]);
    var Py=c2[3]+u*(c3[3]-c2[3]);
    var Qx=c0[2]+u*(c1[2]-c0[2]);
    var Qy=c0[3]+u*(c1[3]-c0[3]);
    var Pn=c2[4]+u*(c3[4]-c2[4]);
    var Qn=c0[4]+u*(c1[4]-c0[4]);
    var wind_u=Px+v*(Qx-Px);
    var wind_v=Py+v*(Qy-Py);
    var pollute=Pn+v*(Qn-Pn);
    //将风速转化为纬度的变化值。由于是模型，只需要比例正确即可。最终输出值单位为网格数量
    wind_v=wind_v/Math.cos(c[1]/180*Math.PI)/dx*dy;
    //将结果填入网格风速
    speed_u[c[2]][c[3]]=wind_u;
    speed_v[c[2]][c[3]]=wind_v;
    //计算被插值点的污染物浓度
    pollution[c[2]][c[3]]=pollute;
}

//粒子类
var CanvasParticle=function (){
    this.x=null;//粒子初始x位置(网格坐标，可为小数)
    this.y=null;//粒子初始y位置(网格坐标，可为小数)
    this.tx=null;//粒子下一步将要移动的x位置
    this.ty=null;//粒子下一步将要移动的y位置
    this.age=null;//粒子生命周期计时器，每次-1
};

//风场类
var CanvasWindy=function (data,params,main_projection){
    this.windData=data;    //风场数据
    this.extent=params.extent;   //经纬度范围
    this.canvasContext=params.canvas.getContext("2d");//canvas上下文
    this.canvasWidth=params.canvasWidth;//画板宽度
    this.canvasHeight=params.canvasHeight;//画板高度
    this.speedRate=params.speedRate;//风前进速率
    this.particlesNumber=params.particlesNumber;//初始粒子总数
    this.maxAge=params.maxAge;//每个粒子的最大生存周期
    this.frameTime=1000/(params.frameRate);//每秒刷新次数
    this.color=params.color;//线颜色
    if (global_transform) {
        this.lineWidth=params.lineWidth * Math.sqrt(Math.sqrt(global_transform.k));//线宽度
    } else {
        this.lineWidth=params.lineWidth;//线宽度
    }
    this.projection=main_projection;  //经纬度投影至canvas  

    this.windField=null;
    this.particles=[];    //存储所有存在于canvas的粒子
    this.animateFrame=null;//requestAnimationFrame事件句柄，用来清除操作
    this._init();
};

//风场初始化
CanvasWindy.prototype={
    constructor:CanvasWindy,
    _init:function(){
        var self=this;
        // 创建风场网格。范围[83,133,18,54]
        this.windField=new CanvasWindField();

        //粒子总数根据地图缩放结果进行修改,使视图内的粒子数量保持恒定
        this.particlesNumber=recalculate_particlesNumber();

        // 创建风场粒子。初始的粒子随机生成
        for (var i=0;i<this.particlesNumber;i++) {
            this.particles.push(this.randomParticle(new CanvasParticle()));
        }

        this.canvasContext.fillStyle="rgba(0, 0, 0, 0.97)";
        this.canvasContext.globalAlpha=0.6;
        this.animate();

        //获取当前时间，用以根据帧率绘制动画
        var then=Date.now();
        (function frame() {
            self.animateFrame=requestAnimationFrame(frame);
            var now=Date.now();
            var delta=now-then;
            if (delta>self.frameTime){
                then=now-delta%self.frameTime;
                self.animate();
            }
        })();
    },

    //根据现有参数重新生成风场(缩放/更改时间轴使用)
    redraw:function(){
        window.cancelAnimationFrame(this.animateFrame);
        this.particles=[];
        this.generateParticleExtent=[];
        this._init();
    },
    
    animate: function(){
        var self=this,
            field=self.windField;
        var nextX=null,
            nextY=null,
            uv=null;
        self.particles.forEach(function(particle){
            //当一个粒子死亡后，再补充一个随机粒子到canvas上，保持画布上风的流动性
            if (particle.age<=0) {
                self.randomParticle(particle);
            }
            if (particle.age>0) {
                var tx=particle.tx,
                    ty=particle.ty;
                //若下一步移动到网格之外，则粒子死亡
                if (!field.isInBound(tx,ty) && !self.isInView(tx,ty)){
                    particle.age=0;
                } 
                else{
                    uv=field.getSpeed(tx,ty);
                    nextX=tx+self.speedRate*uv[0];
                    nextY=ty+self.speedRate*uv[1];
                    particle.x=tx;   //更新粒子坐标为下一轮的坐标
                    particle.y=ty;
                    particle.tx=nextX;   //更新下一轮坐标的移动后坐标
                    particle.ty=nextY;
                    particle.age--;
                }
            }
        });
        if (self.particles.length<=0) this.removeLines();
        self.drawLines();
    },

    removeLines:function(){
        window.cancelAnimationFrame(this.animateFrame);
    },
    //根据粒子当前所处的位置(棋盘网格位置)，得到canvas画板中的位置，以便画图。需要考虑投影和transform
    field2canvas:function(x,y) {
        var field=this.windField,
            fieldWidth=field.cols,   //280
            fieldHeight=field.rows,  //180
            position=[];
        var index=this.field2plane(x,y);   //返回经度和纬度
        position=this.projection(index);
        //对缩放和平移坐标变换
        if(global_transform){
            position[0]=position[0]*global_transform.k+global_transform.x;
            position[1]=position[1]*global_transform.k+global_transform.y;
        }
        return position;
    },
    //网格坐标转化到经纬度
    field2plane:function(x,y){
        var field=this.windField,
            fieldWidth=field.cols,   //280
            fieldHeight=field.rows;  //180
        var index=new Array();
        index[0]=this.extent[0]+x/fieldWidth*(this.extent[1]-this.extent[0]);//lon
        index[1]=this.extent[2]+y/fieldHeight*(this.extent[3]-this.extent[2]);//lat
        return index;
    },
    drawLines:function(){
        var self=this;
        var particles=this.particles;
        this.canvasContext.lineWidth=self.lineWidth;
        if(global_transform){
            this.canvasContext.lineWidth/=global_transform.k;
        }
        //后绘制的图形和前绘制的图形如果发生遮挡的话，只显示后绘制的图形跟前一个绘制的图形重合的前绘制的图形部分，示例：https://www.w3school.com.cn/tiy/t.asp?f=html5_canvas_globalcompop_all
        this.canvasContext.globalCompositeOperation="destination-in";
        this.canvasContext.fillRect(0,0,this.canvasWidth,this.canvasHeight);
        this.canvasContext.globalCompositeOperation="lighter";//重叠部分的颜色会被重新计算(直接相加)
        this.canvasContext.globalAlpha=0.9;

        this.canvasContext.beginPath();
        this.canvasContext.strokeStyle = this.color;
        particles.forEach(function(particle){
            var movetopos=self.field2canvas(particle.x,particle.y);   //当前粒子坐标映射
            var linetopos=self.field2canvas(particle.tx,particle.ty);  //移动后坐标映射
            self.canvasContext.moveTo(movetopos[0],movetopos[1]);     //线起点
            self.canvasContext.lineTo(linetopos[0],linetopos[1]);    //线终点
        });
        this.canvasContext.stroke();   //此处进行透明度的叠加，之前绘制的会不断变得透明
    },

    //随机数生成器（小数）
    fRandomByfloat:function(under, over){ 
       return under+Math.random()*(over-under);
    },

    //根据当前风场网格行列数随机生成粒子
    randomParticle:function(particle) {
        var x,y;
        //生成在地图边界内的粒子
        do{
            x=this.fRandomByfloat(1,this.windField.cols-2);
            y=this.fRandomByfloat(1,this.windField.rows-2);
        }while(!this.windField.isInBound(x,y) && !this.isInView(x,y));
        var field=this.windField;
        var uv=field.getSpeed(x,y);
        //根据速率计算下一步移动到的位置(网格坐标)
        var nextX=x+this.speedRate*uv[0];
        var nextY=y+this.speedRate*uv[1];
        particle.x=x;
        particle.y=y;
        particle.tx=nextX;
        particle.ty=nextY;
        particle.age=Math.round(Math.random()*this.maxAge);//粒子存活时间设定为最大周期的随机百分比
        return particle;
    },
    //判断是否在视图内
    isInView: function(x,y){
        var position=this.field2canvas(x,y);
        var index_x=position[0];
        var index_y=position[1];
        if(index_x>=0 && index_x<canvas_width && index_y>=0 && index_y<canvas_height) return true;
        else return false;
    }
};


//棋盘网格类
var CanvasWindField=function(){
    this.rows=null;
    this.cols=null;
    this.dx=null;
    this.dy=null;
    this.grid=null;
    this._init();
};
//网格初始化
CanvasWindField.prototype = {
    constructor: CanvasWindField,
    _init:function() {

        this.rows=y_grid;
        this.cols=x_grid;
        this.dx=(west-east)/x_grid;   //经度方向跨50°，分成260格
        this.dy=(north-south)/y_grid;   //纬度方向跨36°，分成160格

        this.grid=[];
        var rows,uv;
        for (var i=0;i<this.rows;++i) {
            rows=[];
            for (var j=0;j<this.cols;++j) {
                uv=[speed_u[i][j],speed_v[i][j]];
                rows.push(uv);
            }
            this.grid.push(rows);
        }
    },
    //双线性插值计算给定节点的速度
    grid_interpolation: function(x,y,g00,g10,g01,g11){
        var rx=(1-x);
        var ry=(1-y);
        var a=rx*ry,b=x*ry,c=rx*y,d=x*y;
        var u=g00[0]*a+g10[0]*b+g01[0]*c+g11[0]*d;
        var v=g00[1]*a+g10[1]*b+g01[1]*c+g11[1]*d;
        return [u,v];
    },
    getSpeed: function(x,y){
        //获取邻近的四个点
        var x0=Math.floor(x),
            y0=Math.floor(y);
        if (x0==x&&y0==y) return this.grid[y][x];
        else if(x0==this.cols-2) x0=x0-1;
        else if(y0==this.rows-2) y0=y0-1;

        var g00=this.grid[y0][x0],
            g10=this.grid[y0][x0+1],
            g01=this.grid[y0+1][x0],
            g11=this.grid[y0+1][x0+1];
        return this.grid_interpolation(x-x0,y-y0,g00,g10,g01,g11);
    },
    //判断点是否在界限内。没有初始化风速的点就是地图边界外的点，视为无效
    isInBound: function(x,y){
        if((x>=1 && x<=this.cols-2) && (y>=1 && y<=this.rows-2)){
            var x0=Math.floor(x),y0=Math.floor(y);
            if(x0==x && y0==y){   //点正好在网格上
                if(available[y][x]) return true;
            }
            else if(x0==x){   //点在网格线上
                if(available[y0][x] && available[y0+1][x]) return true;
            }
            else if(y0==y){
                if(available[y][x0] && available[y][x0+1]) return true;
            }
            else{
                if(available[y0][x0] && available[y0][x0+1] && available[y0+1][x0] && available[y0+1][x0+1]) return true;
            }
        } 
        return false;
    }
};

//缩放后风场图重新绘制
function draw_canvas(windy,transform){
    global_transform=transform;
    windy.redraw();
}

//根据缩放计算场景内的粒子数,使得视图内的粒子数量保持恒定
function recalculate_particlesNumber(){
    //初始场景中的粒子个数
    var base_number=2000;
    //初始场景中有数据点的网格数量
    var base_sum=0;
    //缩放后场景中有数据点的网格数量
    var new_sum=0;
    for(var i=0;i<y_grid;++i){
        for(var j=0;j<x_grid;++j){
            if(available[i][j])  base_sum+=1;
        }
    }
    //计算每个网格点缩放后是否在canvas内
    if(global_transform==null){
        return base_number;
    }
    else{
        for(var i=0;i<y_grid;++i){
            var y0=canvas_height-i/(y_grid-1)*canvas_height;
            //计算缩放后坐标
            y0=y0*global_transform.k+global_transform.y;
            for(var j=0;j<x_grid;++j){
                var x0=j/(x_grid-1)*canvas_width;
                //计算缩放后坐标
                x0=x0*global_transform.k+global_transform.x;
                if(x0>=0 && x0<canvas_width && y0>=0 && y0<=canvas_height && available[i][j])  new_sum+=1;
            }
        }
        //计算地图的面积在canvas中占的比例
        //初始时,地图占比为base_sum/(x_grid*y_grid)
        //缩放后,地图占比为new_sum*k*k/(x_grid*y_grid)
        //所以地图中显示的粒子数量为n1=base_number*new_sum*k*k/base_sum

        //之后计算需要初始化的粒子数量
        //根据地图中显示的有效网格点数量,相比于初始有效网格点的数量,与该比例成反比
        //该比例为k1=new_sum/base_sum
        //因此最终初始化的粒子数为n1/k1=base_number*k*k
        return base_number*global_transform.k;
        //return base_number*base_sum/new_sum;
    }
}
