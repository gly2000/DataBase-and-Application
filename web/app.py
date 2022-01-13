# <---------- 导入包库 ---------->
# flask框架用于前后端通信
from flask import Flask, render_template, request, jsonify  # , redirect, url_for
# 用于与数据库交互
import pymysql
# 用于数学计算
import math
# 用于单样本均值检测
from scipy.stats import ttest_1samp
# 用于双侧单侧均值检验
from scipy.stats import ttest_ind
# 用于匹配样本均值检测
from scipy.stats import ttest_rel
# 用于多元回归
import statsmodels.api as sm


def compute_aqi(data, chart):
    aqi_chart = [0, 50, 100, 150, 200, 300, 400, 500]
    aqi = 0

    if data > chart[-1]:
        aqi = 501
        return aqi

    for i in range(len(chart) - 1):
        if chart[i] <= data <= chart[i + 1]:
            aqi = (aqi_chart[i + 1] - aqi_chart[i]) / (chart[i + 1] - chart[i]) * (data - chart[i]) \
                + aqi_chart[i]
            break

    return aqi


def make_aqi_list(pollutant, data_list):
    aqi_list = []

    if pollutant == 'SO2':
        chart = [0, 50, 150, 475, 800, 1600, 2100, 2620]
        for item in data_list:
            aqi_list.append(compute_aqi(item, chart))

    if pollutant == 'NO2':
        chart = [0, 40, 80, 180, 280, 565, 750, 940]
        for item in data_list:
            aqi_list.append(compute_aqi(item, chart))

    if pollutant == 'PM10':
        chart = [0, 50, 150, 250, 350, 420, 500, 600]
        for item in data_list:
            aqi_list.append(compute_aqi(item, chart))

    if pollutant == 'CO':
        chart = [0, 2000, 4000, 14000, 24000, 36000, 48000, 60000]
        for item in data_list:
            aqi_list.append(compute_aqi(item, chart))

    if pollutant == 'O3':
        chart = [0, 100, 160, 215, 265, 800, 1000, 1200]
        for item in data_list:
            aqi_list.append(compute_aqi(item, chart))

    if pollutant == 'PM2_5':
        chart = [0, 35, 75, 115, 150, 250, 350, 500]
        for item in data_list:
            aqi_list.append(compute_aqi(item, chart))

    return aqi_list


# <-----------   基础函数  ----------->
# 样本总体均值，样本总计方差，获得最大值最小值

# 计算样本均值
def sample_mean(a):
    total = 0.0
    for i in range(len(a)):
        total = total + float(a[i])
    return total / len(a)


# 计算总体均值
def population_mean(a):
    total = 0.0
    for i in range(len(a)):
        total = total + float(a[i])
    return total / len(a)


# 计算样本方差
def sample_variance(a):
    samplemean = sample_mean(a)
    variancesum = 0.0
    for i in range(len(a)):
        variancesum = math.pow(float(a[i]) - samplemean, 2)
    return variancesum / (len(a) - 1)


# 计算总体方差
def population_variance(a):
    populationmean = population_mean(a)
    variancesum = 0.0
    for i in range(len(a)):
        variancesum = math.pow(float(a[i]) - populationmean, 2)
    return variancesum / (len(a) - 1)


# 获得最大值
def get_max(a):
    maximum = float(a[0])
    for i in range(len(a)):
        if float(a[i]) > maximum:
            maximum = float(a[i])
    return maximum


# 获得最小值
def get_min(a):
    minimum = float(a[0])
    for i in range(len(a)):
        if float(a[i]) < minimum:
            minimum = float(a[i])
    return minimum


# 用于多元回归是否存在多重共线性
def multicollinearity(a, b):
    Xmodel = sm.add_constant(a)
    model = sm.OLS(b, Xmodel)
    results = model.fit()
    return results.rsquared


# <-----------   假设检验  ----------->
# 用于判断是否应该拒绝两个总体参数值的说法，支持单样本模式、数值模式和匹配样本模式
# 单样本检验：是否有证据表明某地PM2.5值的均值是否高于某个值
def parametric_test_1sample(a, value):
    statistic, pvalue = ttest_1samp(a, value)
    return statistic, pvalue


# 两总体均值之差的双侧检验（总体方差未知且不相等）：是否有证据表明北京和上海PM2.5值的均值不相等
def parametric_test_mean_double(a, b):
    statistic, pvalue = ttest_ind(a, b, equal_var=False)
    return statistic, pvalue


# 两总体均值之差的单侧检验（总体方差未知且不相等）：某地关停了煤炭企业，那么是否有证据表明关停煤炭企业之后PM2.5含量与之前相比下降了；是否有证据表明某地夏季大气污染比冬季更轻
def parametric_test_mean_single(a, b):
    statistic, pvalue = ttest_ind(a, b, equal_var=False)
    pvalue = pvalue / 2
    return statistic, pvalue


# 匹配样本的检验：是否有证据表明实施了新环保法后某地污染物含量下降到了某个值
def parametric_test_mean_matched(a, b, alpha):
    statistic, pvalue = ttest_rel(a, b)
    return statistic, pvalue


# <---------- 前后交互 ---------->
app = Flask(__name__)


# 返回首页(注意改回来)
@app.route('/')
def index():
    return render_template("index.html")


# 返回无需数值计算的数据
@app.route('/request_info', methods=['POST'])
def request_info():
    keys = request.get_json()["keys"]
    keys_list = keys.split('-')
    keys = ','.join(keys_list)
    time = request.get_json()["time"]
    data_type = request.get_json()["type"]

    data_dict = {}
    if time == "":
        pass
    else:
        conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
        cursor = conn.cursor()
        select_data_sql = 'select ' + keys + ' from ' + data_type + ' where TIME = ' + "'" + time + "'"
        print(select_data_sql)
        cursor.execute(select_data_sql)
        selected_data = cursor.fetchall()
        cursor.close()
        conn.close()
        for key in keys_list:
            data_dict[key] = []

        data_dict["TIME"] = time
        for row in selected_data:
            for idx in range(len(keys_list)):
                data_dict[keys_list[idx]].append(row[idx])

    return jsonify(data_dict)


@app.route('/get_location_data', methods=['POST'])
def get_location_data():
    month = request.get_json()['month']
    has31days = ['01', '03', '05', '07', '08', '10', '12']
    has30days = ['04', '06', '09', '11']
    # date_list = []
    data_dict = {
        'PM2_5': [],
        'PM10': [],
        'SO2': [],
        'NO2': [],
        'CO': [],
        'O3': []
    }
    date_limit = ['', '']

    if month in has31days:
        date_limit[0] = month + '0100'
        date_limit[1] = month + '3100'

    elif month[-2:] in has30days:
        date_limit[0] = month + '0100'
        date_limit[1] = month + '3000'

    elif month[-2:] == '02':
        date_limit[0] = month + '0100'
        date_limit[1] = month + '2800'

    else:
        return jsonify(data_dict)

    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data',
                           charset='utf8')
    cursor = conn.cursor()

    keys_list = ['PM2_5', 'PM10', 'SO2', 'NO2', 'CO', 'O3']

    lat = request.get_json()['lat']
    lon = request.get_json()['lon']
    limits = {
        'lat': [lat - 0.001, lat + 0.001],
        'lon': [lon - 0.001, lon + 0.001]
    }
    select_sql_prefix = 'select PM2_5, PM10, SO2, NO2, CO, O3 from daily where '
    years = ['2013', '2014', '2015', '2016', '2017', '2018']

    for year in years:
        average_dict = {
            'PM2_5': 0,
            'PM10': 0,
            'SO2': 0,
            'NO2': 0,
            'CO': 0,
            'O3': 0
        }

        select_sql_suffix = 'TIME >= ' + "'" + year + date_limit[0] + "'" + ' and ' + 'TIME <= ' + "'" + year + \
                            date_limit[1] + "'" + ' and lat < ' + str(limits['lat'][1]) + ' and lat > ' + \
                            str(limits['lat'][0]) + ' and lon < ' + str(limits['lon'][1]) + ' and lon > ' + \
                            str(limits['lon'][0])
        select_sql = select_sql_prefix + select_sql_suffix
        print(select_sql)
        cursor.execute(select_sql)
        selected_data = cursor.fetchall()
        print(len(selected_data))

        for idx in range(len(keys_list)):
            for row in selected_data:
                average_dict[keys_list[idx]] += make_aqi_list(keys_list[idx], [row[idx]])[0]
            average_dict[keys_list[idx]] /= len(selected_data)

        # for idx in range(len(keys_list)):
        #     data_dict[keys_list[idx]].append(make_aqi_list(keys_list[idx], [selected_data[0][idx]])[0])

        for idx in range(len(keys_list)):
            data_dict[keys_list[idx]].append(average_dict[keys_list[idx]])

    cursor.close()
    conn.close()
    return jsonify(data_dict)


# 返回数据画像(指定地点和时间区间)
@app.route('/data_summary_by_time', methods=['POST'])
def data_summary_by_time():
    lat = request.get_json()["lat"]
    lon = request.get_json()["lon"]
    # key = request.get_json()["key"]
    ys = request.get_json()["ys"]
    ms = request.get_json()["ms"]
    ds = request.get_json()["ds"]
    hs = request.get_json()["hs"]
    ye = request.get_json()["ye"]
    me = request.get_json()["me"]
    de = request.get_json()["de"]
    he = request.get_json()["he"]
    types = request.get_json()["type"]
    yymmddhh_start = str(ys) + str(ms) + str(ds) + str(hs)
    yymmddhh_end = str(ye) + str(me) + str(de) + str(he)

    select_data_sql = 'select PM2_5, PM10, SO2, NO2, CO, O3 from ' + types + ' where TIME <= ' + "'" + yymmddhh_end + "'" + ' and ' + "'" + yymmddhh_start + "'" + ' <= TIME ' + ' and lat > ' + str(lat - 0.001) + ' and lat < ' + str(lat + 0.001) + ' and lon > ' + str(lon - 0.001) + ' and lon < ' + str(lon + 0.001)
    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor = conn.cursor()
    print(select_data_sql)
    cursor.execute(select_data_sql)
    selected_data = cursor.fetchall()
    cursor.close()
    conn.close()

    prepared_data = {
        'PM2_5': [],
        'PM10': [],
        'SO2': [],
        'NO2': [],
        'CO': [],
        'O3': []
    }

    keys_list = ['PM2_5', 'PM10', 'SO2', 'NO2', 'CO', 'O3']

    for idx in range(len(keys_list)):
        for row in selected_data:
            prepared_data[keys_list[idx]].append(row[idx])

    # return jsonify(data_dict)
    return jsonify(prepared_data)


# 返回数据画像(指定时刻)
@app.route('/data_summary_by_location', methods=['POST'])
def data_summary_by_location():
    key = request.get_json()["key"]
    y = request.get_json()["y"]
    m = request.get_json()["m"]
    d = request.get_json()["d"]
    h = request.get_json()["h"]
    types = request.get_json()["type"]
    yymmddhh = str(y) + str(m) + str(d) + str(h)

    select_data_sql = 'select ' + key + ' from ' + types + ' where TIME = ' + "'" + yymmddhh + "'"
    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor = conn.cursor()
    print(select_data_sql)
    cursor.execute(select_data_sql)
    selected_data = cursor.fetchall()
    cursor.close()
    conn.close()

    prepared_data = []
    for data in selected_data:
        prepared_data.append(data[0])
    data_dict = {}
    data_dict["mean"] = sample_mean(prepared_data)
    data_dict["variance"] = sample_variance(prepared_data)
    data_dict["maximun"] = get_max(prepared_data)
    data_dict["minimun"] = get_min(prepared_data)
    return jsonify(data_dict)


# 返回单参数检验
@app.route('/parametric_test_one_sample', methods=['POST'])
def parametric_test_one_sample():
    lat = request.get_json()["lat"]
    lon = request.get_json()["lon"]
    key = request.get_json()["key"]
    ys = request.get_json()["ys"]
    ms = request.get_json()["ms"]
    ds = request.get_json()["ds"]
    hs = request.get_json()["hs"]
    ye = request.get_json()["ye"]
    me = request.get_json()["me"]
    de = request.get_json()["de"]
    he = request.get_json()["he"]
    types = request.get_json()["type"]
    value = request.get_json()["value"]
    alpha = request.get_json()["alpha"]
    yymmddhh_start = str(ys) + str(ms) + str(ds) + str(hs)
    yymmddhh_end = str(ye) + str(me) + str(de) + str(he)

    select_data_sql = 'select ' + key + ' from ' + types + ' where TIME <= ' + "'" + yymmddhh_end + "'" + ' and ' + "'" + yymmddhh_start + "'" + ' <= TIME ' + ' and lat > ' + str(lat - 0.001) + ' and lat < ' + str(lat + 0.001) + ' and lon > ' + str(lon - 0.001) + ' and lon < ' + str(lon + 0.001)
    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor = conn.cursor()
    print(select_data_sql)
    cursor.execute(select_data_sql)
    selected_data = cursor.fetchall()
    cursor.close()
    conn.close()

    prepared_data = []
    for data in selected_data:
        prepared_data.append(float(data[0]))
    data_dict = {}
    data_dict["valuestatistic"], data_dict["pvalue"] = parametric_test_1sample(prepared_data, value)  # 如果pvalue大于alpha，不能证明实际情况和设定值有明显区别；如果pvalue小于等于alpha，如果valuestatistic是非负值，说明实际情况小于设定值，如果valuestatistic是负值，说明实际情况大于设定值。
    data_dict["alpha"] = alpha  # 置信度
    return jsonify(data_dict)


# 指定地点不同时间的参数检验
@app.route('/parametric_test_by_time', methods=['POST'])
def parametric_test_by_time():
    lat = request.get_json()["lat"]
    lon = request.get_json()["lon"]
    key = request.get_json()["key"]
    ys1 = request.get_json()["ys1"]
    ms1 = request.get_json()["ms1"]
    ds1 = request.get_json()["ds1"]
    hs1 = request.get_json()["hs1"]
    ye1 = request.get_json()["ye1"]
    me1 = request.get_json()["me1"]
    de1 = request.get_json()["de1"]
    he1 = request.get_json()["he1"]
    ys2 = request.get_json()["ys2"]
    ms2 = request.get_json()["ms2"]
    ds2 = request.get_json()["ds2"]
    hs2 = request.get_json()["hs2"]
    ye2 = request.get_json()["ye2"]
    me2 = request.get_json()["me2"]
    de2 = request.get_json()["de2"]
    he2 = request.get_json()["he2"]
    types = request.get_json()["type"]
    alpha = request.get_json()["alpha"]
    yymmddhh_start1 = str(ys1) + str(ms1) + str(ds1) + str(hs1)
    yymmddhh_end1 = str(ye1) + str(me1) + str(de1) + str(he1)
    yymmddhh_start2 = str(ys2) + str(ms2) + str(ds2) + str(hs2)
    yymmddhh_end2 = str(ye2) + str(me2) + str(de2) + str(he2)

    select_data_sql1 = 'select ' + key + ' from ' + types + ' where TIME <= ' + "'" + yymmddhh_end1 + "'" + ' and ' + "'" + yymmddhh_start1 + "'" + ' <= TIME ' + ' and lat > ' + str(lat - 0.001) + ' and lat < ' + str(lat + 0.001) + ' and lon > ' + str(lon - 0.001) + ' and lon < ' + str(lon + 0.001)
    conn1 = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor1 = conn1.cursor()
    print(select_data_sql1)
    cursor1.execute(select_data_sql1)
    selected_data1 = cursor1.fetchall()
    cursor1.close()
    conn1.close()

    select_data_sql2 = 'select ' + key + ' from ' + types + ' where TIME <= ' + "'" + yymmddhh_end2 + "'" + ' and ' + "'" + yymmddhh_start2 + "'" + ' <= TIME ' + ' and lat > ' + str(lat - 0.001) + ' and lat < ' + str(lat + 0.001) + ' and lon > ' + str(lon - 0.001) + ' and lon < ' + str(lon + 0.001)
    conn2 = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor2 = conn2.cursor()
    print(select_data_sql2)
    cursor2.execute(select_data_sql2)
    selected_data2 = cursor2.fetchall()
    cursor2.close()
    conn2.close()

    prepared_data1 = []
    for data in selected_data1:
        prepared_data1.append(float(data[0]))
    prepared_data2 = []
    for data in selected_data2:
        prepared_data2.append(float(data[0]))
    data_dict = {}
    data_dict["valuestatistic"], data_dict["pvalue"] = parametric_test_mean_double(prepared_data1, prepared_data2)  # 如果pvalue大于alpha，不能证明数据1和数据2有明显区别；如果pvalue小于等于alpha，如果valuestatistic是非负值，说明数据1小于数据2，如果valuestatistic是负值，说明数据1大于数据2。
    data_dict["alpha"] = alpha
    return jsonify(data_dict)


# 指定时间不同地点的参数检验
@app.route('/parametric_test_by_location', methods=['POST'])
def parametric_test_by_location():
    lat1 = request.get_json()["lat1"]
    lon1 = request.get_json()["lon1"]
    lat2 = request.get_json()["lat2"]
    lon2 = request.get_json()["lon2"]
    key = request.get_json()["key"]
    ys = request.get_json()["ys"]
    ms = request.get_json()["ms"]
    ds = request.get_json()["ds"]
    hs = request.get_json()["hs"]
    ye = request.get_json()["ye"]
    me = request.get_json()["me"]
    de = request.get_json()["de"]
    he = request.get_json()["he"]
    types = request.get_json()["type"]
    alpha = request.get_json()["alpha"]
    yymmddhh_start = str(ys) + str(ms) + str(ds) + str(hs)
    yymmddhh_end = str(ye) + str(me) + str(de) + str(he)

    select_data_sql1 = 'select ' + key + ' from ' + types + ' where TIME <= ' + "'" + yymmddhh_end + "'" + ' and ' + "'" + yymmddhh_start + "'" + ' <= TIME ' + ' and lat > ' + str(lat1 - 0.001) + ' and lat < ' + str(lat1 + 0.001) + ' and lon > ' + str(lon1 - 0.001) + ' and lon < ' + str(lon1 + 0.001)
    conn1 = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor1 = conn1.cursor()
    print(select_data_sql1)
    cursor1.execute(select_data_sql1)
    selected_data1 = cursor1.fetchall()
    cursor1.close()
    conn1.close()

    select_data_sql2 = 'select ' + key + ' from ' + types + ' where TIME <= ' + "'" + yymmddhh_end + "'" + ' and ' + "'" + yymmddhh_start + "'" + ' <= TIME ' + ' and lat > ' + str(lat2 - 0.001) + ' and lat < ' + str(lat2 + 0.001) + ' and lon > ' + str(lon2 - 0.001) + ' and lon < ' + str(lon2 + 0.001)
    conn2 = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor2 = conn2.cursor()
    print(select_data_sql2)
    cursor2.execute(select_data_sql2)
    selected_data2 = cursor2.fetchall()
    cursor2.close()
    conn2.close()

    prepared_data1 = []
    for data in selected_data1:
        prepared_data1.append(float(data[0]))
    prepared_data2 = []
    for data in selected_data2:
        prepared_data2.append(float(data[0]))
    data_dict = {}
    data_dict["valuestatistic"], data_dict["pvalue"] = parametric_test_mean_double(prepared_data1, prepared_data2)
    data_dict["alpha"] = alpha
    return jsonify(data_dict)


# 返回多元回归的数据
@app.route('/liner_regression', methods=['POST'])
def liner_regression():
    keys = request.get_json()["key"]
    keys_list = keys.split('-')
    keys = ','.join(keys_list)
    lat = request.get_json()["lat"]
    lon = request.get_json()["lon"]
    dep = request.get_json()["dep"]
    ys = request.get_json()["ys"]
    ms = request.get_json()["ms"]
    ds = request.get_json()["ds"]
    hs = request.get_json()["hs"]
    ye = request.get_json()["ye"]
    me = request.get_json()["me"]
    de = request.get_json()["de"]
    he = request.get_json()["he"]
    types = request.get_json()["type"]
    yymmddhh_start = str(ys) + str(ms) + str(ds) + str(hs)
    yymmddhh_end = str(ye) + str(me) + str(de) + str(he)

    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor = conn.cursor()
    select_data_sql = select_data_sql = 'select ' + keys + ' from ' + types + ' where TIME <= ' + "'" + yymmddhh_end + "'" + ' and ' + "'" + yymmddhh_start + "'" + ' <= TIME ' + ' and lat > ' + str(lat - 0.001) + ' and lat < ' + str(lat + 0.001) + ' and lon > ' + str(lon - 0.001) + ' and lon < ' + str(lon + 0.001)
    print(select_data_sql)
    cursor.execute(select_data_sql)
    selected_data = cursor.fetchall()
    cursor.close()
    conn.close()

    conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
    cursor = conn.cursor()
    select_data_sql = select_data_sql = 'select ' + dep + ' from ' + types + ' where TIME <= ' + "'" + yymmddhh_end + "'" + ' and ' + "'" + yymmddhh_start + "'" + ' <= TIME ' + ' and lat > ' + str(lat - 0.001) + ' and lat < ' + str(lat + 0.001) + ' and lon > ' + str(lon - 0.001) + ' and lon < ' + str(lon + 0.001)
    print(select_data_sql)
    cursor.execute(select_data_sql)
    selected_data1 = cursor.fetchall()
    cursor.close()
    conn.close()

    prepared_data = []
    for data in selected_data:
        tmp = []
        for i in range(len(data)):
            tmp.append(float(data[i]))
        prepared_data.append(tmp)

    data_dict = {}
    data_dict["sym1"] = []
    data_dict["sym2"] = []
    data_dict["milt"] = []
    # 检查多重共线性
    for i in range(len(keys_list)):
        for j in range(len(keys_list)):
            if i > j:
                a = [x[i] for x in prepared_data]
                b = [x[j] for x in prepared_data]
                result = multicollinearity(a, b)
                data_dict["sym1"].append(i)
                data_dict["sym2"].append(j)
                data_dict["milt"].append(result)  # 检查有没有某项大于0.9，如果有，告知x和y之间可能存在多贡献性，回归结果不可靠，请修改因变量

    Xmodel = sm.add_constant(prepared_data)

    y = []
    for data in selected_data1:
        y.append(data[0])
    model = sm.OLS(y, Xmodel)
    results = model.fit()
    print(results.summary())

    data_dict["pvalues"] = []
    data_dict["para"] = []
    for idx in range(len(results.params)):
        data_dict["para"].append(results.params[idx])
        data_dict["pvalues"].append(results.pvalues[idx])
    data_dict["condition"] = results.condition_number
    data_dict["r2"] = results.rsquared
    data_dict["r2_adj"] = results.rsquared_adj
    print(data_dict["para"])  # 第一个是常数，后面是对应系数
    print(data_dict["pvalues"])  # 个数是自变量数值加1，0到1之间，越小越显著，阈值0.05
    return jsonify(data_dict)


'''
# 返回时间序列的数据TBD
@app.route('/time_series', methods=['POST'])
def time_series():
'''


# 主程序入口
if __name__ == '__main__':
    app.run()
