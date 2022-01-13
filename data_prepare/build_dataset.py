from config import DATA_PATH
import pymysql
import csv
import os

conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='82714669', db='vis_data', charset='utf8')
cursor = conn.cursor()

# drop_daily_table_sql = 'drop table if exists daily'
# create_daily_table_sql = """
#     create table if not exists daily (
#     daily_id int not null AUTO_INCREMENT PRIMARY KEY,
#     PM2_5 float not null,
#     PM10 float not null,
#     SO2 float not null,
#     NO2 float not null,
#     CO float not null,
#     O3 float not null,
#     U float not null,
#     V float not null,
#     TEMP float not null,
#     RH float not null,
#     PSFC float not null,
#     lat float not null,
#     lon float not null,
#     TIME varchar(20) not null
#     )
# """
# cursor.execute(drop_daily_table_sql)
# cursor.execute(create_daily_table_sql)
#
# insert_daily_sql_prefix = \
#     'insert into daily (PM2_5, PM10, SO2, NO2, CO, O3, U, V, TEMP, RH, PSFC, lat, lon, TIME) values '
#
# daily_data = os.path.join(DATA_PATH, "daily")
# # print(os.listdir(daily_data))
# for _ in os.listdir(daily_data):
#     months = os.listdir(os.path.join(daily_data, _))
#     # print(months)
#     for month in months:
#         csv_filenames = os.listdir(os.path.join(daily_data, _, month))
#         # print(csv_filenames)
#         for csv_filename in csv_filenames:
#             time = csv_filename.split('-')[3].strip(".csv")
#             # print(time)
#             csv_filename = os.path.join(daily_data, _, month, csv_filename)
#             csv_file = open(csv_filename, encoding='utf-8')
#             csv_reader = csv.reader(csv_file)
#             content = [row for row in csv_reader]
#             content = content[1:]
#             for row in content:
#                 row[: -1] = list(map(float, row[: -1]))
#                 row[-1] = time
#                 # print(row)
#                 insert_daily_sql = insert_daily_sql_prefix + str(tuple(row))
#                 # print(insert_daily_sql)
#                 cursor.execute(insert_daily_sql)
#
#             # print(content)
#             conn.commit()
#             print("Finished inserting: " + csv_filename)
#
#
# print("Finished loading daily data! ---------------------------------")

drop_hourly_table_sql = 'drop table if exists hourly'
create_hourly_table_sql = """
    create table if not exists hourly (
    hourly_id int not null AUTO_INCREMENT PRIMARY KEY,
    PM2_5 float not null,
    PM10 float not null,
    SO2 float not null,
    NO2 float not null,
    CO float not null,
    O3 float not null,
    U float not null,
    V float not null,
    TEMP float not null,
    RH float not null,
    PSFC float not null,
    lat float not null,
    lon float not null,
    TIME varchar(20) not null
    )
"""
cursor.execute(drop_hourly_table_sql)
cursor.execute(create_hourly_table_sql)

insert_hourly_sql_prefix = \
    'insert into hourly (PM2_5, PM10, SO2, NO2, CO, O3, U, V, TEMP, RH, PSFC, lat, lon, TIME) values '

hourly_data = os.path.join(DATA_PATH, "hourly")
# print(os.listdir(hourly_data))
for year in os.listdir(hourly_data):
    csv_filenames = os.listdir(os.path.join(hourly_data, year))
    for csv_filename in csv_filenames:
        time = csv_filename.split('-')[1].strip("Reanalysis.csv")
        csv_filename = os.path.join(hourly_data, year, csv_filename)
        csv_file = open(csv_filename, encoding='utf-8')
        csv_reader = csv.reader(csv_file)
        content = [row for row in csv_reader]
        content = content[1:]
        for row in content:
            row[: -1] = list(map(float, row[: -1]))
            row[-1] = time
            # print(row)
            insert_hourly_sql = insert_hourly_sql_prefix + str(tuple(row))
            # print(insert_hourly_sql)
            cursor.execute(insert_hourly_sql)

        # print(content)
        conn.commit()
        print("Finished inserting: " + csv_filename)

print("Finished loading hourly data! ---------------------------------")

cursor.close()
conn.close()
