function clear_selection(){
    var selections=d3.select('#month_selection')
                  .remove();
}

function Draw_stack_line(data){
    clear_selection();
    console.log(data);
    var dom = document.getElementById("container");
    var myecharts = echarts.init(dom);
    // 获取数据
    var pollute_list=["PM2_5","PM10","SO2","NO2","CO","O3"];
    // 配置
    var option = null;
    option = {
        title: {
            x:15,
            text: "污染物浓度趋势图"
        },
        // legend: {
        //     x:150,
        //     show: true,
        // },
        legend:[
            {
                data:["PM2.5"],
                x:180,
                y:0,
                z:-1
            },{
                data:["PM10"],
                x:250,
                y:0,
                z:-1
            },{
                data:["SO2"],
                x:320,
                y:0,
                z:-1
            },{
                data:["NO2"],
                x:180,
                y:20,
                z:-1
            },{
                data:["CO"],
                x:250,
                y:20,
                z:-1
            },{
                data:["O3"],
                x:320,
                y:20,
                z:-1
            },
        ],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            },
        },
        grid: {
            top: '10%',
            left: '4%',
            right: '4%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data['date'],
            //boundaryGap: false
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'PM2.5',
                type: 'line',
                data: data['PM2_5'],
                stack: '总量',
                areaStyle: {}
            }, {
                name: 'PM10',
                type: 'line',
                data: data['PM10'],
                stack: '总量',
                areaStyle: {}
            }, {
                name: 'SO2',
                type: 'line',
                data: data['SO2'],
                stack: '总量',
                areaStyle: {}
            }, {
                name: 'NO2',
                type: 'line',
                data: data['NO2'],
                stack: '总量',
                areaStyle: {}
            },{
                name: 'CO',
                type: 'line',
                data: data['CO'],
                stack: '总量',
                areaStyle: {}
            }, {
                name: 'O3',
                type: 'line',
                data: data['O3'],
                stack: '总量',   // 数据堆叠，同个类目轴上系列配置相同的stack值后，后一个系列的值会在前一个系列的值上相加
                // label: {        // 设置显示图形上的文本标签，可用于说明图形的一些数据信息，比如值，名称等
                //     normal: {
                //         show: true,
                //         position: 'top'
                //     }
                // },
                areaStyle: {}
            }
        ]

    };
    if (option && typeof option == 'object') {
        myecharts.setOption(option);
    }
}

function Draw_stack_rect(data){
    var dom=document.getElementById("container");
    var myecharts = echarts.init(dom);	
    let option = {
    title: {
        x:15,
        text: "污染物年度同期对比"
    },
    tooltip : {
        trigger: 'axis',
        axisPointer : {            
            type : 'shadow'        
        }
    },
    legend:[
        {
            data:["PM2.5"],
            x:190,
            y:0
        },{
            data:["PM10"],
            x:260,
            y:0
        },{
            data:["SO2"],
            x:330,
            y:0
        },{
            data:["NO2"],
            x:190,
            y:20
        },{
            data:["CO"],
            x:260,
            y:20
        },{
            data:["O3"],
            x:330,
            y:20
        },
    ],
    grid: {
        top: '12%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : data['date'],
            // min: function(value){
            //     return value.min-1;
            // },
            // max: function(value){
            //     return value.max+1;
            // }
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'PM2.5',
            type:'bar',
            stack:'总量',
            data:data['PM2_5']
        },
        {
            name:'PM10',
            type:'bar',
            stack: '总量',
            data:data['PM10']
        },
        {
            name:'SO2',
            type:'bar',
            stack: '总量',
            data:data['SO2']
        },
        {
            name:'NO2',
            type:'bar',
            stack: '总量',
            data:data['NO2']
        },
        {
            name:'CO',
            type:'bar',
            stack: '总量',
            data:data['CO']
        },
        {
            name:'O3',
            type:'bar',
            stack: '总量',
            data:data['O3']
        }
    ]
};
		if (option && typeof option == 'object') {
        myecharts.setOption(option);
    }

}

function Draw_histogram(json_data){
    clear_selection();
    console.log(json_data);
    var data={
        'PM2.5':new Array(),
        'PM10':new Array(),
        'SO2':new Array(),
        'NO2':new Array(),
        'CO':new Array(),
        'O3':new Array()
    }
    for(var i=0;i<6;++i){
        data['PM2.5'][i]=0;
        data['PM10'][i]=0;
        data['SO2'][i]=0;
        data['NO2'][i]=0;
        data['CO'][i]=0;
        data['O3'][i]=0;
    }
    for(var i=0;i<json_data['PM2_5'].length;++i){
        switch(true){
            case json_data['PM2_5'][i]<=50:
                data['PM2.5'][0]+=1;
                break;
            case json_data['PM2_5'][i]<=100:
                data['PM2.5'][1]+=1;
                break;
            case json_data['PM2_5'][i]<=150:
                data['PM2.5'][2]+=1;
                break;
            case json_data['PM2_5'][i]<=200:
                data['PM2.5'][3]+=1;
                break;   
            case json_data['PM2_5'][i]<=300:
                data['PM2.5'][4]+=1;
                break;
            case json_data['PM2_5'][i]>300:
                data['PM2.5'][5]+=1;
                break; 
        }
        switch(true){
            case json_data['PM10'][i]<=50:
                data['PM10'][0]+=1;
                break;
            case json_data['PM10'][i]<=100:
                data['PM10'][1]+=1;
                break;
            case json_data['PM10'][i]<=150:
                data['PM10'][2]+=1;
                break;
            case json_data['PM10'][i]<=200:
                data['PM10'][3]+=1;
                break;   
            case json_data['PM10'][i]<=300:
                data['PM10'][4]+=1;
                break;
            case json_data['PM10'][i]>300:
                data['PM10'][5]+=1;
                break; 
        } 
        switch(true){
            case json_data['SO2'][i]<=50:
                data['SO2'][0]+=1;
                break;
            case json_data['SO2'][i]<=100:
                data['SO2'][1]+=1;
                break;
            case json_data['SO2'][i]<=150:
                data['SO2'][2]+=1;
                break;
            case json_data['SO2'][i]<=200:
                data['SO2'][3]+=1;
                break;   
            case json_data['SO2'][i]<=300:
                data['SO2'][4]+=1;
                break;
            case json_data['SO2'][i]>300:
                data['SO2'][5]+=1;
                break; 
        } 
        switch(true){
            case json_data['NO2'][i]<=50:
                data['NO2'][0]+=1;
                break;
            case json_data['NO2'][i]<=100:
                data['NO2'][1]+=1;
                break;
            case json_data['NO2'][i]<=150:
                data['NO2'][2]+=1;
                break;
            case json_data['NO2'][i]<=200:
                data['NO2'][3]+=1;
                break;   
            case json_data['NO2'][i]<=300:
                data['NO2'][4]+=1;
                break;
            case json_data['NO2'][i]>300:
                data['NO2'][5]+=1;
                break; 
        } 
        switch(true){
            case json_data['CO'][i]<=50:
                data['CO'][0]+=1;
                break;
            case json_data['CO'][i]<=100:
                data['CO'][1]+=1;
                break;
            case json_data['CO'][i]<=150:
                data['CO'][2]+=1;
                break;
            case json_data['CO'][i]<=200:
                data['CO'][3]+=1;
                break;   
            case json_data['CO'][i]<=300:
                data['CO'][4]+=1;
                break;
            case json_data['CO'][i]>300:
                data['CO'][5]+=1;
                break; 
        } 
        switch(true){
            case json_data['O3'][i]<=50:
                data['O3'][0]+=1;
                break;
            case json_data['O3'][i]<=100:
                data['O3'][1]+=1;
                break;
            case json_data['O3'][i]<=150:
                data['O3'][2]+=1;
                break;
            case json_data['O3'][i]<=200:
                data['O3'][3]+=1;
                break;   
            case json_data['O3'][i]<=300:
                data['O3'][4]+=1;
                break;
            case json_data['O3'][i]>300:
                data['O3'][5]+=1;
                break; 
        }  
    }
    var dom = document.getElementById("container");
    var myecharts = echarts.init(dom);
    let option = {
        title:{
            x:15,
            text:"污染AQI频数统计"
        },
        tooltip:{
            trigger:'axis',
            axisPointer:{            
                type:'shadow'        
            }
        },
        legend:[
            {
                data:["PM2.5"],
                x:190,
                y:0
            },{
                data:["PM10"],
                x:260,
                y:0
            },{
                data:["SO2"],
                x:330,
                y:0
            },{
                data:["NO2"],
                x:190,
                y:20
            },{
                data:["CO"],
                x:260,
                y:20
            },{
                data:["O3"],
                x:330,
                y:20
            },
        ],
        grid: {
            top:'12%',
            left:'3%',
            right:'4%',
            bottom:'3%',
            containLabel:true
        },
        xAxis :[
            {
                type:'category',
                data:['0-50','51-100','101-150','151-200','201-300','>300']
            }
        ],
        yAxis : [
            {
                type:'value'
            }
        ],
        series :[
            {
                name:'PM2.5',
                type:'bar',
                stack:"PM2.5",
                data:data['PM2.5']
            },
            {
                name:'PM10',
                type:'bar',
                stack:'PM10',
                data:data["PM10"]
            },
            {
                name:'SO2',
                type:'bar',
                stack:'SO2',
                data:data['SO2']
            },
            {
                name:'NO2',
                type:'bar',
                stack:'NO2',
                data:data['NO2']
            },
            {
                name:'CO',
                type:'bar',
                stack:'CO',
                data:data['CO']
            },
            {
                name:'O3',
                type:'bar',
                stack:'O3',
                data:data['O3']
            }
        ]
    };
    if (option && typeof option == 'object') {
        myecharts.setOption(option);
    }
}

// class Chart {
//     constructor(){
//         this._width = 700;
//         this._height = 400;
//         this._margins = {top:10, left:10, right:10, bottom:10};
//         this._data = [];
//         this._scaleX = null;
//         this._scaleY = null;
//         this._colors = d3.scaleOrdinal(d3.schemeCategory10);
//         this._box = null;
//         this._svg = null;
//         this._body = null;
//         this._padding = {top:10, left:10, right:10, bottom:10};
//     }

//     width(w){
//         if (arguments.length === 0) return this._width;
//         this._width = w;
//         return this;
//     }

//     height(h){
//         if (arguments.length === 0) return this._height;
//         this._height = h;
//         return this;
//     }

//     margins(m){
//         if (arguments.length === 0) return this._margins;
//         this._margins = m;
//         return this;
//     }

//     data(d){
//         if (arguments.length === 0) return this._data;
//         this._data = d;
//         return this;
//     }

//     scaleX(x){
//         if (arguments.length === 0) return this._scaleX;
//         this._scaleX = x;
//         return this;
//     }

//     scaleY(y){
//         if (arguments.length === 0) return this._scaleY;
//         this._scaleY = y;
//         return this;
//     }

//     svg(s){
//         if (arguments.length === 0) return this._svg;
//         this._svg = s;
//         return this;
//     }

//     body(b){
//         if (arguments.length === 0) return this._body;
//         this._body = b;
//         return this;
//     }

//     box(b){
//         if (arguments.length === 0) return this._box;
//         this._box = b;
//         return this;
//     }

//     getBodyWidth(){
//         let width = this._width - this._margins.left - this._margins.right;
//         return width > 0 ? width : 0;
//     }

//     getBodyHeight(){
//         let height = this._height - this._margins.top - this._margins.bottom;
//         return height > 0 ? height : 0;
//     }

//     padding(p){
//         if (arguments.length === 0) return this._padding;
//         this._padding = p;
//         return this;
//     }

//     defineBodyClip(){

//         this._svg.append('defs')
//                  .append('clipPath')
//                  .attr('id', 'clip')
//                  .append('rect')
//                  .attr('width', this.getBodyWidth() + this._padding.left + this._padding.right)
//                  .attr('height', this.getBodyHeight() + this._padding.top  + this._padding.bottom)
//                  .attr('x', -this._padding.left)
//                  .attr('y', -this._padding.top);
//     }

//     render(){
//         return this;
//     }

//     bodyX(){
//         return this._margins.left;

//     }

//     bodyY(){
//         return this._margins.top;
//     }

//     renderBody(){
//         if (!this._body){
//             this._body = this._svg.append('g')
//                             .attr('class', 'body')
//                             .attr('transform', 'translate(' + this.bodyX() + ',' + this.bodyY() + ')')
//                             .attr('clip-path', "url(#clip)");
//         }

//         this.render();
//     }

//     renderChart(){
//         if (!this._box){
//             this._box = d3.select('body')
//                             .append('div')
//                             .attr('class','box');
//         }

//         if (!this._svg){
//             this._svg = this._box.append('svg')
//                             .attr("id","stack_graph")
//                             .attr('width', this._width)
//                             .attr('height', this._height);
//         }

//         this.defineBodyClip();

//         this.renderBody();
//     }
// }


// function Draw_stack_line(data){
//     clear_graph();
//     console.log(data);
//     var pollute_list=new Array();
//     if(typeof(data[0]['PM2_5'])!='undefined') pollute_list.push('PM2_5');
//     //if(typeof(data[0]['PM10'])!='undefined') pollute_list.push('PM10');
//     //if(typeof(data[0]['SO2'])!='undefined') pollute_list.push('SO2');
//     //if(typeof(data[0]['NO2'])!='undefined') pollute_list.push('NO2');
//     //if(typeof(data[0]['CO'])!='undefined') pollute_list.push('CO');
//     //if(typeof(data[0]['O3'])!='undefined') pollute_list.push('O3');
//     /* ----------------------------配置参数------------------------  */
//     const chart = new Chart();
//     const config = {
//         margins: {top: 30, left: 30, bottom: 30, right: 30},
//         textColor: 'black',
//         gridColor: 'gray',
//         ShowGridX: [],
//         ShowGridY: [50, 100, 150, 200, 250, 300, 350, 400],
//         title: '堆叠面积图',
//         pointSize: 1,
//         pointColor: 'white',
//         hoverColor: 'red',
//         animateDuration: 1000
//     }

//     chart.margins(config.margins);
    
//     /* ----------------------------尺度转换------------------------  */
//     chart.scaleX = d3.scalePoint()
//                     .domain(data.map((d)=>d.date))
//                     .range([0,chart.getBodyWidth()])
    
//     chart.scaleY = d3.scaleLinear()
//                     .domain([0,Math.floor((d3.max(data,(d)=>d['PM2_5'])+d3.max(data,(d)=>d['PM10'])+d3.max(data,(d)=>d['SO2'])+d3.max(data,(d)=>d['NO2'])+d3.max(data,(d)=>d['CO'])+d3.max(data,(d)=>d['O3'])))])
//                     .range([chart.getBodyHeight(), 0])

//     chart.stack = d3.stack()
//                     .keys(pollute_list)
//                     .offset(d3.stackOffsetNone);

//     /* ----------------------------渲染线条------------------------  */
//     chart.renderLines = function(){
//         let lines = chart.body().selectAll('.line')
//                     .data(chart.stack(data));
//             lines.enter()
//                     .append('path')
//                     .attr('class', (d) => 'line line-' + d.key)
//                     .merge(lines)
//                     .attr('fill', 'none')
//                     .attr('stroke', (d,i) => chart._colors(i))
//                     .transition().duration(config.animateDuration)
//                     .attrTween('d', lineTween);
//             lines.exit()
//                     .remove();
//             //中间帧函数
//             function lineTween(_d){
//                 if (!_d) return;
//                 const generateLine = d3.line()
//                                         .x((d) => d[0])
//                                         .y((d) => d[1]);
//                 const pointX = data.map((d) => chart.scaleX(d.date));
//                 const pointY = _d.map((d) => chart.scaleY(d[1]));
//                 console.log(pointX);
//                 console.log(pointY);
//                 const interpolate = getInterpolate(pointX, pointY);                
//                 const ponits = [];
//                 const interval = 1/(pointX.length-1);
//                 let index = 0;
//                 return function(t){
//                     if (t - interval > 0 && t % interval < Math.pow(10, -1.4)){  //保证线条一定经过数据点
//                         index = Math.floor(t / interval);
//                         ponits.push([pointX[index], pointY[index]]);
//                     }else{
//                         ponits.push([interpolate.x(t), interpolate.y(t)]);
//                     }
//                     console.log(t,ponits);
//                     return generateLine(ponits);
//                 }
//             }

//             //点插值
//             function getInterpolate(pointX, pointY){
//                 const domain = d3.range(0, 1, 1/(pointX.length-1));
//                 domain.push(1);
//                 const interpolateX = d3.scaleLinear()
//                                         .domain(domain)
//                                         .range(pointX);
//                 const interpolateY = d3.scaleLinear()
//                                         .domain(domain)
//                                         .range(pointY);
//                 return {
//                     x: interpolateX,
//                     y: interpolateY
//                 };
//             }
//     }

//     /* ----------------------------渲染点------------------------  */
//     chart.renderPonits = function(){
//         chart.stack(data).forEach((pointData, i) => {
//             let ponits = chart.body().selectAll('.point-' + pointData.key)
//                     .data(pointData);
//             ponits.enter()
//                     .append('circle')
//                     .attr('class', 'point point-' + pointData.key)
//                     .merge(ponits)
//                     .attr('cx', (d) => chart.scaleX(d.data.date))
//                     .attr('cy', (d) => chart.scaleY(d[1]))
//                     .attr('r', 0)
//                     .attr('fill', config.pointColor)
//                     .attr('stroke', chart._colors(i))
//                     .transition().duration(config.animateDuration)
//                     .attr('r', config.pointSize)
//                     .attr('value', (d) => pointData.key + ':' + d.data[pointData.key]);
//         });
//     };
//     /* ----------------------------渲染面------------------------  */
//     chart.renderArea = function(){
//         const areas = chart.body().insert('g',':first-child')
//                         .selectAll('.area')
//                         .data(chart.stack(data));
              
//               areas.enter()
//                         .append('path')
//                         .attr('class', (d) => 'area area-' + d.key)
//                         .merge(areas)
//                         .style('fill', (d,i) => chart._colors(i))
//                         .transition().duration(config.animateDuration)
//                         .attrTween('d', areaTween);

//         //中间帧函数
//         function areaTween(_d){
//             if (!_d) return;
//             const generateArea = d3.area()
//                         .x((d) => d[0])
//                         .y0((d) => d[1])
//                         .y1((d) => d[2]);

//             const pointX = data.map((d) => chart.scaleX(d.date));
//             const pointY0 = _d.map((d) => chart.scaleY(d[0]));
//             const pointY1 = _d.map((d) => chart.scaleY(d[1]));

//             const interpolate = getAreaInterpolate(pointX, pointY0, pointY1);                
//             const ponits = []
//             return function(t){
//                 ponits.push([interpolate.x(t), interpolate.y0(t), interpolate.y1(t)]);
//                 return generateArea(ponits);
//             }
//         }

//         //点插值
//         function getAreaInterpolate(pointX, pointY0, pointY1){
//             const domain = d3.range(0, 1, 1/(pointX.length-1));
//             domain.push(1);
//             const interpolateX = d3.scaleLinear()
//                                     .domain(domain)
//                                     .range(pointX);
//             const interpolateY0 = d3.scaleLinear()
//                                     .domain(domain)
//                                     .range(pointY0);
//              const interpolateY1 = d3.scaleLinear()
//                                     .domain(domain)
//                                     .range(pointY1);
//             return {
//                 x: interpolateX,
//                 y0: interpolateY0,
//                 y1: interpolateY1
//             };
//         }
//     }
//     /* ----------------------------渲染坐标轴------------------------  */
//     chart.renderX = function(){
//         chart.svg().insert('g','.body')
//                 .attr('transform', 'translate(' + chart.bodyX() + ',' + (chart.bodyY() + chart.getBodyHeight()) + ')')
//                 .attr('class', 'xAxis') 
//                 .call(d3.axisBottom(chart.scaleX));
//     }
//     chart.renderY = function(){
//         chart.svg().insert('g','.body')
//                 .attr('transform', 'translate(' + chart.bodyX() + ',' + chart.bodyY() + ')')
//                 .attr('class', 'yAxis')
//                 .call(d3.axisLeft(chart.scaleY));
//     }
//     chart.renderAxis = function(){
//         chart.renderX();
//         chart.renderY();
//     }

//     /* ----------------------------渲染文本标签------------------------  */
//     chart.renderText = function(){
//         d3.select('.xAxis').append('text')
//                             .attr('class', 'axisText')
//                             .attr('x', chart.getBodyWidth())
//                             .attr('y', 0)
//                             .attr('fill', config.textColor)
//                             .attr('dy', 40)
//                             .text('date');

//         d3.select('.yAxis').append('text')
//                             .attr('class', 'axisText')
//                             .attr('x', 0)
//                             .attr('y', 0)
//                             .attr('fill', config.textColor)
//                             .attr('transform', 'rotate(-90)')
//                             .attr('dy', -40)
//                             .attr('text-anchor','end')
//                             .text('AQI');
//     }

//     /* ----------------------------渲染网格线------------------------  */
//     chart.renderGrid = function(){
//         d3.selectAll('.yAxis .tick')
//             .each(function(d, i){
//                 if (config.ShowGridY.indexOf(d) > -1){
//                     d3.select(this).append('line')
//                         .attr('class','grid')
//                         .attr('stroke', config.gridColor)
//                         .attr('x1', 0)
//                         .attr('y1', 0)
//                         .attr('x2', chart.getBodyWidth())
//                         .attr('y2', 0);
//                 }
//             });
//         d3.selectAll('.xAxis .tick')
//             .each(function(d, i){
//                 if (config.ShowGridX.indexOf(d) > -1){
//                     d3.select(this).append('line')
//                         .attr('class','grid')
//                         .attr('stroke', config.gridColor)
//                         .attr('x1', 0)
//                         .attr('y1', 0)
//                         .attr('x2', 0)
//                         .attr('y2', -chart.getBodyHeight());
//                 }
//             });
//     }

//     /* ----------------------------渲染图标题------------------------  */
//     chart.renderTitle = function(){
//         chart.svg().append('text')
//                 .classed('title', true)
//                 .attr('x', chart.width()/2)
//                 .attr('y', 0)
//                 .attr('dy', '2em')
//                 .text(config.title)
//                 .attr('fill', config.textColor)
//                 .attr('text-anchor', 'middle')
//                 .attr('stroke', config.textColor);
//     }
//     /* ----------------------------绑定鼠标交互事件------------------------  */
//     chart.addMouseOn = function(){
//         //防抖函数
//         function debounce(fn, time){
//             let timeId = null;
//             return function(){
//                 const context = this;
//                 const event = d3.event;
//                 timeId && clearTimeout(timeId)
//                 timeId = setTimeout(function(){
//                     d3.event = event;
//                     fn.apply(context, arguments);
//                 }, time);
//             }
//         }
//         d3.selectAll('.point')
//             .on('mouseover', function(event,d){
//                 const e = d3.event;
//                 const position = d3.pointer(event,chart.svg().node());
//                 event.target.style.cursor = 'hand'

//                 d3.select(event.target)
//                     .attr('fill', config.hoverColor);
                
//                 chart.svg()
//                     .append('text')
//                     .classed('tip', true)
//                     .attr('x', position[0]+5)
//                     .attr('y', position[1])
//                     .attr('fill', config.textColor)
//                     .text(() => {
//                         return d3.select(this).attr('value');
//                     });
//             })
//             .on('mouseleave', function(event){
//                 const e = d3.event;
                
//                 d3.select(event.target)
//                     .attr('fill', config.pointColor);
                    
//                 d3.select('.tip').remove();
//             })
//             .on('mousemove',function(event){
//                     const position = d3.pointer(event,chart.svg().node());
//                     d3.select('.tip')
//                     .attr('x', position[0]+5)
//                     .attr('y', position[1]-5);
//                 },
//             );
//     }
        
//     chart.render = function(){
//         chart.renderAxis();
//         chart.renderText();
//         chart.renderGrid();
//         chart.renderLines();
//         chart.renderPonits();
//         chart.renderTitle();
//         chart.addMouseOn();
//         chart.renderArea();
//     }
//     chart.renderChart();    
// }

// function Draw_stack_rect(){
//     d3.csv('./static/js/graph/data.csv', function(d){
//         return {
//             date: d.date,
//             food: +d.food,
//             transportation: +d.transportation,
//             education: +d.education
//         };
//     }).then(function(data){
//         clear_graph();
    
//         /* ----------------------------配置参数------------------------  */
//         const chart = new Chart();
//         const config = {
//             barPadding: 0.15,
//             margins: {top: 80, left: 80, bottom: 50, right: 80},
//             textColor: 'black',
//             gridColor: 'gray',
//             tickShowGrid: [60, 120, 180],
//             title: '堆叠直方图',
//             hoverColor: 'white',
//             animateDuration: 1000
//         }
    
//         chart.margins(config.margins);
        
//         /* ----------------------------尺度转换------------------------  */
//         chart.scaleX = d3.scaleBand()
//                         .domain(data.map((d) => d.date))
//                         .range([0, chart.getBodyWidth()])
//                         .padding(config.barPadding);
        
//         chart.scaleY = d3.scaleLinear()
//                         .domain([0, d3.max(data.map((d) => d.food + d.transportation + d.education))])
//                         .range([chart.getBodyHeight(), 0])
        
//         chart.stack = d3.stack()
//                         .keys(['food', 'transportation', 'education'])
//                         .order(d3.stackOrderAscending)
//                         .offset(d3.stackOffsetNone);
        
//         /* ----------------------------渲染柱形------------------------  */
//         chart.renderBars = function(){
    
//             let groups = chart.body().selectAll('.g')
//                             .data(chart.stack(data));
                        
//             let bars = groups.enter()
//                         .append('g')
//                       .merge(groups)
//                         .attr('class', (d) => 'g ' + d.key)
//                         .attr('fill', (d,i) => chart._colors(i))
//                         .selectAll('.bar')
//                         .data((d)=>{
//                             return d.map((item) => {
//                                 item.index = d.index;
//                                 item.name = d.key;
//                                 return item;
//                             });
//                         });
                
//                 groups.exit()
//                         .remove();
    
//                 bars.enter()
//                         .append('rect')
//                         .attr('class', 'bar')
//                     .merge(bars)
//                         .attr('x', (d) => chart.scaleX(d.data.date))
//                         .attr('y', (d) => chart.scaleY(d[0]))
//                         .attr('width', chart.scaleX.bandwidth())
//                         .attr('height', 0)
//                         .transition().duration(config.animateDuration)
//                         .attr('height', (d) => chart.scaleY(d[0]) - chart.scaleY(d[1]))
//                         .attr('y', (d) => chart.scaleY(d[1]));
                
//                 bars.exit()
//                         .remove();
//         }
    
//         /* ----------------------------渲染坐标轴------------------------  */
//         chart.renderX = function(){
//             chart.svg().insert('g','.body')
//                     .attr('transform', 'translate(' + chart.bodyX() + ',' + (chart.bodyY() + chart.getBodyHeight()) + ')')
//                     .attr('class', 'xAxis')
//                     .call(d3.axisBottom(chart.scaleX));
//         }
    
//         chart.renderY = function(){
//             chart.svg().insert('g','.body')
//                     .attr('transform', 'translate(' + chart.bodyX() + ',' + chart.bodyY() + ')')
//                     .attr('class', 'yAxis')
//                     .call(d3.axisLeft(chart.scaleY));
//         }
    
//         chart.renderAxis = function(){
//             chart.renderX();
//             chart.renderY();
//         }
    
//         /* ----------------------------渲染文本标签------------------------  */
//         chart.renderText = function(){
//             d3.select('.xAxis').append('text')
//                                 .attr('class', 'axisText')
//                                 .attr('x', chart.getBodyWidth())
//                                 .attr('y', 0)
//                                 .attr('fill', config.textColor)
//                                 .attr('dy', 30)
//                                 .text('日期');
    
//             d3.select('.yAxis').append('text')
//                                 .attr('class', 'axisText')
//                                 .attr('x', 0)
//                                 .attr('y', 0)
//                                 .attr('fill', config.textColor)
//                                 .attr('transform', 'rotate(-90)')
//                                 .attr('dy', -40)
//                                 .attr('text-anchor','end')
//                                 .text('每日支出（元）');
//         }
    
//         /* ----------------------------渲染网格线------------------------  */
//         chart.renderGrid = function(){
//             d3.selectAll('.yAxis .tick')
//                 .each(function(d, i){
//                     if (config.tickShowGrid.indexOf(d) > -1){
//                         d3.select(this).append('line')
//                             .attr('class','grid')
//                             .attr('stroke', config.gridColor)
//                             .attr('x1', 0)
//                             .attr('y1', 0)
//                             .attr('x2', chart.getBodyWidth())
//                             .attr('y2', 0);
//                     }
//                 });
//         }
    
//         /* ----------------------------渲染图标题------------------------  */
//         chart.renderTitle = function(){
//             chart.svg().append('text')
//                     .classed('title', true)
//                     .attr('x', chart.width()/2)
//                     .attr('y', 0)
//                     .attr('dy', '2em')
//                     .text(config.title)
//                     .attr('fill', config.textColor)
//                     .attr('text-anchor', 'middle')
//                     .attr('stroke', config.textColor);
    
//         }
    
//         /* ----------------------------绑定鼠标交互事件------------------------  */
//         chart.addMouseOn = function(){
//             //防抖函数
//             function debounce(fn, time){
//                 let timeId = null;
//                 return function(){
//                     const context = this;
//                     const event = d3.event;
//                     timeId && clearTimeout(timeId)
//                     timeId = setTimeout(function(){
//                         d3.event = event;
//                         fn.apply(context, arguments);
//                     }, time);
//                 }
//             }
    
//             d3.selectAll('.bar')
//                 .on('mouseover', function(event,d){
//                     const e = d3.event;
//                     const position = d3.pointer(event,chart.svg().node());
    
//                     d3.select(event.target)
//                         .attr('fill', config.hoverColor);
                    
//                     chart.svg()
//                         .append('text')
//                         .classed('tip', true)
//                         .attr('x', position[0]+5)
//                         .attr('y', position[1])
//                         .attr('fill', config.textColor)
//                         .text( d.name + ':' + d.data.food + '元');
//                 })
//                 .on('mouseleave', function(event,d){
//                     const e = d3.event;
                    
//                     d3.select(event.target)
//                         .attr('fill', chart._colors(d.index));
                        
//                     d3.select('.tip').remove();
//                 })
//                 .on('mousemove',function(event){
//                         const position = d3.pointer(event,chart.svg().node());
//                         d3.select('.tip')
//                         .attr('x', position[0]+5)
//                         .attr('y', position[1]-5);
//                     },
//                 );
//         }
            
//         chart.render = function(){
    
//             chart.renderAxis();
    
//             chart.renderText();
    
//             chart.renderGrid();
    
//             chart.renderBars();
    
//             chart.addMouseOn();
    
//             chart.renderTitle();
//         }
    
//         chart.renderChart();
        
            
//     });
// }

// function clear_graph(){
//     var tmp_graph=d3.select("#stack_graph")
//                   .remove();
// }