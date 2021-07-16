from django.http.response import JsonResponse
from django.shortcuts import render
import hashlib as hb
import random
from numpy import select
from rest_framework import viewsets
from .serializers import *
from .models import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django.core.mail import send_mail
from django.core.files.storage import FileSystemStorage
from reportlab.platypus import Table
from reportlab.platypus import TableStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph
import reportlab.platypus
from reportlab.lib.pagesizes import letter
from django.db import connection
import os
from datetime import datetime, timedelta
from django.conf import settings
from django.core.files import File
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import pandas as pd
import matplotlib.pyplot as plt
import traceback
from django.http import  Http404
from InvoiceGenerator.api import Invoice, Item, Client, Provider, Creator
from InvoiceGenerator.pdf import SimpleInvoice
from tempfile import NamedTemporaryFile
from threading import Thread
from pathlib import Path
from PIL import ImageDraw, ImageFont, Image
from num2words import num2words as nw
from datetime import date
import itertools
import re
from django.db.models import Sum

def my_custom_sql(code):
    with connection.cursor() as cursor:
        cursor.execute(code)
        row = cursor.fetchall()
    return row

@api_view(['POST'])
def loginCheck(request):
    if(request.method == 'POST'):
        current_email = request.data.get('email')
        
        current_password = request.data.get('password')
        
        try:
            login_row = Login.objects.get(pk=current_email)
        except:
            return Response({"err":"email", "msg":"Email does not exist"})
        if(login_row.password == hb.sha256(current_password.encode()).hexdigest()):
            request.session['email'] = current_email
            return Response({"email":current_email, "type":login_row.type})
            
        else:

            return Response({"err":"password", "msg":'Wrong password'})

@api_view(['POST'])
def get_users(request):
    if(request.method == 'POST'):
        #Login(email = "admin@gmail.com", password =hb.sha256("admin".encode()).hexdigest(), type = "Owner").save()
        try:
            users = list(Login.objects.all().values())
        except:
            return Response([])
        
        return Response(users)

@api_view(['POST'])
def create_user(request):
    if(request.method == 'POST'):
        
        try:
            data = request.data
            # print(data["type"])
            if Login.objects.filter(pk=data["email"]).exists():
                return Response(['User already exists', "warning"])
            mat = validate_password(data["password"])            
            if mat:
                new_user = Login(email= data["email"], password= hb.sha256(data["password"].encode()).hexdigest(), type= data["type"].capitalize())
                new_user.save()
                return Response(['user created', 'success'])
            else:
                return Response(["Password should be 8-20 characters long and contain atleast 1 special character, lowercase, upperccase character and 1 number", "primary"])
        except:
            # traceback.print_exc()
            return Response(['db error, user not created', "danger"])


        
@api_view(['POST'])
def deleteUsers(request):
    if(request.method == 'POST'):
        current_email = request.data.get('email')
        try:
            login_row = Login.objects.get(pk=current_email)
        except:
            return Response("NO user found")
    login_row.delete()
    users = list(Login.objects.all().values())
    return Response(users)


@api_view(['POST'])
def ForgotPassword(request):
    if(request.method == 'POST'):
        data = request.data
        try:
            if Login.objects.filter(pk=data["email"]).exists():
                otp = ''.join([str(random.randint(0,9)) for i in range(7)])
                send_mail(
                    'Otp for ras',
                    otp,
                    'hari.19cs@kct.ac.in',
                    [request.data['email']],                    
                    fail_silently=False,
                )
                
                user = Login.objects.get(pk = data["email"])
                user.Otp = otp
                user.save()

                return (Response({"cango": True}))
            else:
                return Response(" does not exist")
        except:
            return Response("Try After Some Time")

def validate_password(password):
    reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{8,20}$"
      
    # compiling regex
    pat = re.compile(reg)
    # searching regex                 
    return re.search(pat, password)            

@api_view(['POST'])
def OtpValidation(request):
    if(request.method == 'POST'):
        data = request.data
        if data["number"] == Login.objects.get(pk=data["email"]).Otp:
            user = Login.objects.get(pk=data["email"])
            user.otp = ''
            user.save()
            return (Response({"cango": True}))
            
        else:
            user = Login.objects.get(pk=data["email"])
            user.otp = ''
            user.save()
            return Response(["Otp Invalid", "danger"])

@api_view(['POST'])
def ChangePassword(request):
    if(request.method == 'POST'):
        data = request.data
        if (data["password"] and data["email"]):
            user = Login.objects.get(pk=data["email"])
            #print(len(hb.sha256(data["password"].encode()).hexdigest()))
            mat = validate_password(data["password"])
            if mat:
                user.password = hb.sha256(data["password"].encode()).hexdigest()
                user.save()
                return (Response({"cango": True}))
            else:
                return Response(["Password should be 8-20 characters long and contain atleast 1 special character, lowercase, upperccase character and 1 number", "primary"])
            
        else:
            return Response(["Otp Invalid", "danger"])

@api_view(['POST'])
def CreateCsv(request):
    if(request.method == "POST"):
        """ query = Sales.objects.get(item_code = 24)
        print(query.item_code)
        query = list(Sales.objects.values('item_code').annotate(quantity = Sum('quantity')))
        for i in query:
            food = Food.objects.get(item_code = i['item_code'])
            i['COST'] = i['quantity']*food.price
            i['name'] = food.name
        print(query) """
        try:
            filename = request.data['file']+".csv"

            if request.data['file'] == 'sales_report':
                query = list(Sales.objects.values('item_code').annotate(quantity = Sum('quantity')).filter(date__gte = request.data['date'] ))
                for i in query:
                    food = Food.objects.get(item_code = i['item_code'])
                    i['COST'] = i['quantity']*food.price
                    i['name'] = food.name
                #data = pd.DataFrame(my_custom_sql("SELECT sales.item_code, food.name, sum(sales.quantity) as quantity, sum(food.price*sales.quantity) as COST FROM food inner JOIN sales ON FOOD.ITEM_CODE = SALES.ITEM_CODE where date(sales.date) >= {} group by (food.item_code)".format(request.data['date'])), columns = ["Item Code" , "Food name", "Quatity" , "Cost"])
                data = pd.DataFrame(query)
                # print(data)
            elif request.data['file'] == 'purchase_report':
                data = pd.DataFrame(my_custom_sql("select purchase.ingredient_id, inventory.name, purchase.quantity, purchase.price, cast(purchase.date as char) from purchase inner join inventory on purchase.ingredient_id = inventory.ingredient_id where purchase.date >= {}".format(request.data['date'])), columns = ["Ingredient Id", "Ingredient name", "Quantity", "Price", "Purchase time"])
            
            else:
                sales_data = pd.DataFrame(my_custom_sql("SELECT sales.item_code, food.name, sales.quantity, food.price*sales.quantity as COST , CAST(sales.date AS char) FROM food inner JOIN sales ON FOOD.ITEM_CODE = SALES.ITEM_CODE where date(sales.date) >= {}".format(request.data['date'])), columns = ["Item Code" , "Food name", "Quatity" , "Cost","Sale time"])
                purchase_data = pd.DataFrame(my_custom_sql("select purchase.ingredient_id, inventory.name, purchase.quantity, purchase.price, cast(purchase.date as char) from purchase inner join inventory on purchase.ingredient_id = inventory.ingredient_id where purchase.date >= {}".format(request.data['date'])), columns = ["Ingredient Id", "Ingredient name", "Quantity", "Price", "Purchase time"])
                data = []
                total_sales = sales_data['Cost'].sum()
                total_purchase = purchase_data['Price'].sum()
                gross_income = total_sales - total_purchase
                data.append(("Total sales amount",total_sales))
                data.append(("Total purchase amount",total_purchase))
                data.append(("Loss",abs(gross_income)) if gross_income<0 else ("Profit", gross_income))
                data = pd.DataFrame(data)

            data.to_csv(filename)

            BASE_DIR = getattr(settings, "BASE_DIR", None)
            filepath = os.path.join(BASE_DIR,filename)
            
            with open(filepath, 'rb') as ex:
                file_data = ex.read()
            response = HttpResponse(file_data, content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="' + filename +'"'
            #print(response)
            return (response)
        except:
            # traceback.print_exc()
            return Response({"db error"})

@api_view(['POST'])
def CreateExcel(request):
    BASE_DIR = getattr(settings, "BASE_DIR", None)
    filename = request.data['file']+".xlsx"
    filepath = os.path.join(BASE_DIR, filename)
    writer = pd.ExcelWriter(filepath, engine="xlsxwriter")

    if request.data['file'] == 'sales_report':
        sheet_name = 'Sales Report'
        data = pd.DataFrame(my_custom_sql("SELECT sales.item_code, food.name, sum(sales.quantity) as quantity, sum(food.price*sales.quantity) as COST FROM food inner JOIN sales ON FOOD.ITEM_CODE = SALES.ITEM_CODE where date(sales.date) >= {} group by (food.item_code)".format(request.data['date'])), columns = ["Item Code" , "Food name", "Quatity" , "Cost"])
        data.to_excel(writer, sheet_name=sheet_name)
        worksheet = writer.sheets[sheet_name]

    elif request.data['file'] == 'purchase_report':
        sheet_name = 'Purchase Report'
        data = pd.DataFrame(my_custom_sql("select purchase.ingredient_id, inventory.name, purchase.quantity, purchase.price, cast(purchase.date as char) from purchase inner join inventory on purchase.ingredient_id = inventory.ingredient_id where purchase.date >= {}".format(request.data['date'])), columns = ["Ingredient Id", "Ingredient name", "Quantity", "Price", "Purchase time"])
        data.to_excel(writer, sheet_name=sheet_name)
        worksheet = writer.sheets[sheet_name]
    
    else:
        sheet_name = 'Gross Income'
        sales_data = pd.DataFrame(my_custom_sql("SELECT sales.item_code, food.name, sales.quantity, food.price*sales.quantity as COST , CAST(sales.date AS char) FROM food inner JOIN sales ON FOOD.ITEM_CODE = SALES.ITEM_CODE where date(sales.date) >= {}".format(request.data['date'])), columns = ["Item Code" , "Food name", "Quatity" , "Cost","Sale time"])
        purchase_data = pd.DataFrame(my_custom_sql("select purchase.ingredient_id, inventory.name, purchase.quantity, purchase.price, cast(purchase.date as char) from purchase inner join inventory on purchase.ingredient_id = inventory.ingredient_id where purchase.date >= {}".format(request.data['date'])), columns = ["Ingredient Id", "Ingredient name", "Quantity", "Price", "Purchase time"])
        
        monthly_sales = list(my_custom_sql('''
        select
            sum(IIF(month = '01', total, 0)) 'Jan',
            sum(IIF(month = '02', total, 0)) 'Feb',
            sum(IIF(month = '03', total, 0)) 'Mar',
            sum(IIF(month = '04', total, 0)) 'Apr',
            sum(IIF(month = '05', total, 0)) 'May',
            sum(IIF(month = '06', total, 0)) 'Jun',
            sum(IIF(month = '07', total, 0)) 'Jul',
            sum(IIF(month = '08', total, 0)) 'Aug',
            sum(IIF(month = '09', total, 0)) 'Sep',
            sum(IIF(month = '10', total, 0)) 'Oct',
            sum(IIF(month = '11', total, 0)) 'Nov',
            sum(IIF(month = '12', total, 0)) 'Dec'
            from(
                select strftime('%m', sales.date) as month, sum(food.price*sales.quantity) as total
                from food inner join sales on sales.item_code = food.item_code
                where date(sales.date) <= datetime('now','localtime') and date(sales.date) >= date(date('now','localtime'), '-12 month')
                group by strftime("%m-%Y", date(sales.date))) as sub
        '''))

        monthly_purchase = list(my_custom_sql('''
        select
            sum(IIF(month = '01', total, 0)) 'Jan',
            sum(IIF(month = '02', total, 0)) 'Feb',
            sum(IIF(month = '03', total, 0)) 'Mar',
            sum(IIF(month = '04', total, 0)) 'Apr',
            sum(IIF(month = '05', total, 0)) 'May',
            sum(IIF(month = '06', total, 0)) 'Jun',
            sum(IIF(month = '07', total, 0)) 'Jul',
            sum(IIF(month = '08', total, 0)) 'Aug',
            sum(IIF(month = '09', total, 0)) 'Sep',
            sum(IIF(month = '10', total, 0)) 'Oct',
            sum(IIF(month = '11', total, 0)) 'Nov',
            sum(IIF(month = '12', total, 0)) 'Dec'
            from(
                select strftime('%m', purchase.date) as month, sum(purchase.price) as total
                from purchase inner join inventory on purchase.ingredient_id = inventory.ingredient_id
                where date(purchase.date) <= datetime('now','localtime') and date(purchase.date) >= date(date('now','localtime'), '-12 month')
                group by strftime("%m-%Y", date(purchase.date))) as sub
        '''))

        monthly_income = []
        for i in range(12):
            monthly_income.append(float(monthly_sales[0][i])-float(monthly_purchase[0][i]))
        mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        curmonth = datetime.now().month
        curyear = datetime.now().year
        months = ["{} {}".format(i, str(curyear-1)) for i in mon[curmonth:]]
        cur_yr = ["{} {}".format(i, str(curyear)) for i in mon[:curmonth]]
        months.extend(cur_yr)

        
        plt.figure(figsize=(4,4))
        plt.xlabel("Month")
        plt.ylabel("Income")
        plt.title("Monthly income comparison")
        plt.xticks( rotation=90)
        plt.yticks(rotation=90)
        plt.axhline(y=0, c='g', linewidth = 1, ls='--')
        plt.plot(months, monthly_income, marker='o')
        image_link = os.path.join(BASE_DIR,"monthly_comparison.png")
        plt.savefig(image_link, bbox_inches = "tight")

        data = []
        total_sales = sales_data['Cost'].sum()
        total_purchase = purchase_data['Price'].sum()
        gross_income = total_sales - total_purchase
        data.append(("Total sales amount",total_sales))
        data.append(("Total purchase amount",total_purchase))
        data.append(("Loss",abs(gross_income)) if gross_income<0 else ("Profit", gross_income))
        data = pd.DataFrame(data)

        data.to_excel(writer, sheet_name=sheet_name)
        worksheet = writer.sheets[sheet_name]
        worksheet.insert_image('E2',image_link)

    writer.save()
    for i in range(10000):
        pass
    with open(filepath, 'rb') as ex:
        file_data = ex.read()
    
     
    response = HttpResponse(file_data, content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response['Content-Disposition'] = 'attachment;'
    # print(response)
    return response

@api_view(['POST'])
def Create_Pdf(request):
    filename = request.data['file'] + ".pdf"
    pdf = SimpleDocTemplate(filename, pagesize=letter) 
    BASE_DIR = getattr(settings, "BASE_DIR", None)

    customColor = colors.Color(red=(74.0/255),green=(98.0/255),blue=(255.0/255))
    customColor1 = colors.Color(red=(150.0/255),green=(180.0/255),blue=(255.0/255))
    customColor2= colors.Color(red=(255.0/255),green=(255.0/255),blue=(255.0/255))

    def setBackground(table, rowNumb):
        for i in range(1, rowNumb):
            if i % 2 == 0:
                bc = customColor1
            else:
                bc = customColor2
            
            ts = TableStyle(
                [
                ('BACKGROUND', (0,i),(-1,i), bc),
                ('BOX',(0,0),(-1,-1),1,colors.black),
                ('GRID',(0,0),(-1,-1),1,colors.black),
                ('BACKGROUND', (0,0), (-1,0), customColor),
                ('TEXTCOLOR',(0,0),(-1,0),colors.whitesmoke),
                ('ALIGN',(0,0),(-1,-1),'CENTER'),
                ('FONTSIZE', (0,0), (-1,0), 14),
                ('BOTTOMPADDING', (0,0), (-1,0), 12)]
            )
            table.setStyle(ts)
    
    def setIncomeBackground(table, rowNumb):
        for i in range(1, rowNumb):
            if i % 2 == 0:
                bc = customColor1
            else:
                bc = customColor2

            ts = TableStyle(
                [
                ('BACKGROUND', (0,i),(-1,i), bc),
                ('BOX',(0,0),(-1,-1),1,colors.black),
                ('GRID',(0,0),(-1,-1),1,colors.black),
                ('ALIGN',(0,0),(-1,-1),'CENTER'),]
            )
            table.setStyle(ts)

    elems = []

    if request.data['file'] == 'sales_report':
        #print("SELECT sales.item_code, food.name, sales.quantity, food.price*sales.quantity as COST , CAST(sales.date AS char) FROM food inner JOIN sales ON FOOD.ITEM_CODE = SALES.ITEM_CODE where date(sales.date) >= {}".format(request.data['date']))
        # print(request.data['date'])
        # print("SELECT sales.item_code, food.name, sales.quantity, food.price*sales.quantity as COST , CAST(sales.date AS char) FROM food inner JOIN sales ON FOOD.ITEM_CODE = SALES.ITEM_CODE where date(sales.date) >= {}".format(request.data['date']))
        sales_data = list(my_custom_sql("SELECT sales.item_code, food.name, sum(sales.quantity) as quantity, sum(food.price*sales.quantity) as COST FROM food inner JOIN sales ON FOOD.ITEM_CODE = SALES.ITEM_CODE where date(sales.date) >= {} group by (food.item_code)".format(request.data['date'])))
        sales_head = ["Item Code" , "Food name", "Quatity" , "Cost"]
        sales_data.insert(0, sales_head)
        sales_table = Table(sales_data)
        setBackground(sales_table, len(sales_data))
        elems.append(Paragraph("Sales report from "+datetime.strptime(request.data['date'],"%Y-%m-%d").strftime("%d-%m-%Y"),ParagraphStyle("List", parent = getSampleStyleSheet()['Heading1'], alignment = 1, spaceAfter = 30)))
        elems.append(sales_table)
    
    elif request.data['file'] == 'purchase_report':
        purchase_data = list(my_custom_sql("select purchase.ingredient_id, inventory.name, purchase.quantity, purchase.price, cast(purchase.date as char) from purchase inner join inventory on purchase.ingredient_id = inventory.ingredient_id where purchase.date >= {}".format(request.data['date'])))
        purchase_head = ["Ingredient Id", "Ingredient name", "Quantity", "Price", "Purchase time"]
        purchase_data.insert(0, purchase_head)
        purchase_table = Table(purchase_data)
        setBackground(purchase_table, len(purchase_data))
        elems.append(Paragraph("Purchase report from "+datetime.strptime(request.data['date'],"%Y-%m-%d").strftime("%d-%m-%Y"),ParagraphStyle("List", parent = getSampleStyleSheet()['Heading1'], alignment = 1, spaceAfter = 30)))
        elems.append(purchase_table)

    else:
        sales_data = list(my_custom_sql("SELECT sales.item_code, food.name, sales.quantity, food.price*sales.quantity as COST , CAST(sales.date AS char) FROM food inner JOIN sales ON FOOD.ITEM_CODE = SALES.ITEM_CODE where date(sales.date) >= {}".format(request.data['date'])))
        purchase_data = list(my_custom_sql("select purchase.ingredient_id, inventory.name, purchase.quantity, purchase.price, cast(purchase.date as char) from purchase inner join inventory on purchase.ingredient_id = inventory.ingredient_id where purchase.date >= {}".format(request.data['date'])))
        
        monthly_sales = list(my_custom_sql('''
        select
            sum(IIF(month = '01', total, 0)) 'Jan',
            sum(IIF(month = '02', total, 0)) 'Feb',
            sum(IIF(month = '03', total, 0)) 'Mar',
            sum(IIF(month = '04', total, 0)) 'Apr',
            sum(IIF(month = '05', total, 0)) 'May',
            sum(IIF(month = '06', total, 0)) 'Jun',
            sum(IIF(month = '07', total, 0)) 'Jul',
            sum(IIF(month = '08', total, 0)) 'Aug',
            sum(IIF(month = '09', total, 0)) 'Sep',
            sum(IIF(month = '10', total, 0)) 'Oct',
            sum(IIF(month = '11', total, 0)) 'Nov',
            sum(IIF(month = '12', total, 0)) 'Dec'
            from(
                select strftime('%m', sales.date) as month, sum(food.price*sales.quantity) as total
                from food inner join sales on sales.item_code = food.item_code
                where date(sales.date) <= datetime('now','localtime') and date(sales.date) >= date(date('now','localtime'), '-12 month')
                group by strftime("%m-%Y", date(sales.date))) as sub
        '''))
        # print(monthly_sales)
        monthly_purchase = list(my_custom_sql('''
        select
            sum(IIF(month = '01', total, 0)) 'Jan',
            sum(IIF(month = '02', total, 0)) 'Feb',
            sum(IIF(month = '03', total, 0)) 'Mar',
            sum(IIF(month = '04', total, 0)) 'Apr',
            sum(IIF(month = '05', total, 0)) 'May',
            sum(IIF(month = '06', total, 0)) 'Jun',
            sum(IIF(month = '07', total, 0)) 'Jul',
            sum(IIF(month = '08', total, 0)) 'Aug',
            sum(IIF(month = '09', total, 0)) 'Sep',
            sum(IIF(month = '10', total, 0)) 'Oct',
            sum(IIF(month = '11', total, 0)) 'Nov',
            sum(IIF(month = '12', total, 0)) 'Dec'
            from(
                select strftime('%m', purchase.date) as month, sum(purchase.price) as total
                from purchase inner join inventory on purchase.ingredient_id = inventory.ingredient_id
                where date(purchase.date) <= datetime('now','localtime') and date(purchase.date) >= date(date('now','localtime'), '-12 month')
                group by strftime("%m-%Y", date(purchase.date))) as sub
        '''))
        # print(monthly_purchase)
        monthly_income = []
        for i in range(12):
            monthly_income.append(float(monthly_sales[0][i])-float(monthly_purchase[0][i]))
        mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        curmonth = datetime.now().month
        curyear = datetime.now().year
        months = ["{} {}".format(i, str(curyear-1)) for i in mon[curmonth:]]
        cur_yr = ["{} {}".format(i, str(curyear)) for i in mon[:curmonth]]
        months.extend(cur_yr)
        # print(months)

        # print(monthly_income)
        gross_income_data = []

        total_sales = sum([i[3] for i in sales_data])
        total_purchase = sum([i[3] for i in purchase_data])
        gross_income = total_sales - total_purchase
        gross_income_data.append(("Total sales amount",total_sales))
        gross_income_data.append(("Total purchase amount",total_purchase))
        gross_income_data.append(("Loss",abs(gross_income)) if gross_income<0 else ("Profit", gross_income))

        gross_income_table = Table(gross_income_data, colWidths=(4*inch,1*inch))


        plt.figure(figsize=(4,4))
        plt.xlabel("Month")
        plt.ylabel("Income")
        plt.title("Monthly income comparison")
        plt.xticks( rotation=90)
        plt.yticks(rotation=90)
        plt.axhline(y=0, c='g', linewidth = 1, ls='--')
        
        plt.plot(months, monthly_income, marker='o')
        #plt.savefig("monthly_comparison.png", bbox_inches = "tight")
        image_link = os.path.join(BASE_DIR,"monthly_comparison.png")
        plt.savefig(image_link, bbox_inches = "tight")
        setIncomeBackground(gross_income_table, len(gross_income_data))
        elems.append(Paragraph("Gross Income from "+datetime.strptime(request.data['date'],"%Y-%m-%d").strftime("%d-%m-%Y"),ParagraphStyle("List", parent = getSampleStyleSheet()['Heading1'], alignment = 1,spaceAfter =30)))
        elems.append(gross_income_table)  
        elems.append(Paragraph("",ParagraphStyle("List", spaceAfter =15)))
        # print(image_link)
        image = reportlab.platypus.Image(image_link)
        elems.append(image)
        
    
    pdf.build(elems)
    #print("ok")
    #return Response("ok")
    try:
        path_to_file = os.path.join(BASE_DIR, filename)
        f = open(path_to_file, 'rb')
        pdfFile = File(f)
        response = HttpResponse(pdfFile, content_type = 'applicaiton/pdf')
        response['Content-Disposition'] = 'inline;filename="{}.pdf"'.format(filename)
        return response
    except FileNotFoundError:
        raise Http404()

@api_view(['POST'])
def get_chart_sales(request):

    if(request.method=='POST'):
        # x=list(my_custom_sql("select Food.name, sum(quantity) from sales join Food on (Food.item_code = sales.item_code) Where (Food.isvisible = 1 AND sales.DATE >= date(date('now','localtime'), '-1 month')) group by Food.item_code"))
        # print(x)
        # amt = my_custom_sql("select sum(price) from purchase where (DATE >= date(date('now','localtime'), '-1 month'))")
        # print(amt)
        x= list(Food.objects.filter(isvisible = 1, sales__date__gte = datetime.now() - timedelta(days = 30)).annotate(quan = Sum('sales__quantity')).values_list('name', 'quan'))
        amt = sum(list(Purchase.objects.filter(date__gte = datetime.now() - timedelta(days = 30)).values_list('price', flat=True)))
        # print(x)
        color = []
        labels, data = zip(*x)
        labels = list(labels)
        # print(labels, data)
        l = len(data)
        while l>0:
            col ='rgba(' + str(random.randint(0, 200)) + "," + str(random.randint(0,200)) + "," + str(random.randint(0, 200)) + ", 0.9)"
            if col not in color:
                color.append(col)
                l-=1
            else:
                continue
    
        return Response({"labels":labels,"datasets":[{"label":"Amount Spent = {}".format(amt),"data":data, "backgroundColor": color
            ,}]})  

@api_view(['POST'])
def get_chart_purchase(request):

    if(request.method=='POST'):
        # x=list(my_custom_sql("select inventory.name, sum(Purchase.QUANTITY) from purchase join Inventory on (Inventory.ingredient_id = purchase.INGREDIENT_ID) where (DATE >= date(date('now','localtime'), '-1 month')) group by Inventory.ingredient_id"))
        # amt = my_custom_sql("select sum(price) from purchase where (DATE >= date(date('now','localtime'), '-1 month'))")
        # print(x)
        x= list(Inventory.objects.filter(purchase__date__gte = datetime.now() - timedelta(days = 30)).annotate(quan = Sum('purchase__quantity')).values_list('name', 'quan'))
        amt = sum(list(Purchase.objects.filter(date__gte = datetime.now() - timedelta(days = 30)).values_list('price', flat=True)))
        print(x)
        color = []
        labels, data = zip(*x)
        # print(labels, data)
        l = len(data)
        while l>0:
            col ='rgba(' + str(random.randint(0, 200)) + "," + str(random.randint(0,200)) + "," + str(random.randint(0, 200)) + ", 0.9)"
            if col not in color:
                color.append(col)
                l-=1
            else:
                continue
    
        return Response({"labels":labels,"datasets":[{"label":"Amount Spent = {}".format(amt),"data":data, "backgroundColor": color
            ,}]})             


@api_view(['POST'])
def update_price(request):
    try:
        changed = request.data
        for item in changed:
            """ query = "update food set price={} where item_code={}".format(changed[item], item)
            my_custom_sql(query) """
            food = Food.objects.get(item_code = item)
            food.price = changed[item]
            food.save()
        return Response("Success")
    except:
        # traceback.print_exc()
        return Response("Db error") 

@api_view(['POST'])
def GetFoodsForClerk(request):
    try:
        #print(request.data)
        
        # query = 'select UPPER(name), price, image, item_code from food where (isvisible = 1 AND (name like "%{}%" OR food.item_code like "%{}%"))'.format(request.data["val"],request.data["val"])
        # # print(query)
        # result = list(my_custom_sql(query))   
        result = list(Food.objects.filter(Q(name__contains = request.data["val"]) | Q(item_code__contains = request.data["val"])).filter(isvisible = 1).values_list('name','price','image','item_code'))
        # print(result)
        # print(result)
        return Response(result)
    except:
        # traceback.print_exc()
        return Response({"Db error"}) 

@api_view(['POST'])
def get_foods(request):
    # query = "select item_code, name, price from food where food.isvisible = 1"
    # result = list(my_custom_sql(query))
    result = list(Food.objects.filter(isvisible = 1).values_list('item_code', 'name', 'price'))
    #print(result)
    return Response(result)

@api_view(['POST'])
def getingredient_list(request):
    try:
        if(request.method=='POST'):
            """ query="select name from inventory"
            result = list(my_custom_sql(query))
            result = [i[0] for i in result] """
            result = list([i[0] for i in Inventory.objects.all().values_list('name')])
            # print(result)
            return Response(result)
        else:
            return Response({"no inventory"})
    except:
        # traceback.print_exc()
        return Response({"Try after some time"})
 
@api_view(['POST'])
def add_food(request):
    try:
        if(request.method=='POST'):
            #print("all done")
            data=request.data
            if Food.objects.filter(name = data["foodname"].upper()).exists():
                return Response(["food already exists try some other name","danger"])
            ingredientsList = data["nameList"]
            quantityList = data["quantityList"]
            complementaryList=data["complement"]
            #print(complementaryList)
            """ complementDict=dict(my_custom_sql("select name,item_code from food"))
            ingredientsdict=dict(my_custom_sql("select name,ingredient_id from inventory")) """
            complementDict = dict(Food.objects.all().values_list('name', 'item_code'))
            ingredientsdict = dict(Inventory.objects.all().values_list('name', 'ingredient_id'))
            if Food.objects.filter(name=data["foodname"]).exists():
                return Response(["food already exists","warning"])
            else:
                for i in range(0,len(ingredientsList)):
                    ingredientsList[i] = str(ingredientsdict[ingredientsList[i]])
                for i in range(0,len(complementaryList)):
                    if(len(complementaryList)!=0):
                        complementaryList[i]=str(complementDict[complementaryList[i]])
                visibility=1
                if(float(data["price"])==0.0):
                    visibility=0
                ingListString = ",".join(ingredientsList)
                ingquantityString=",".join(str(_) for _ in quantityList)
                complementString = ",".join(complementaryList)
                new_food = Food(name= data["foodname"].upper(),ingredient_list_id=ingListString,quantity_list=ingquantityString,price=data["price"],isvisible=visibility,complementory_list = complementString)
                new_food.save()
                # print("finish")
                return Response(["food created","success"])
    except:
        # traceback.print_exc()
        return Response(["food created","danger"])
 
@api_view(['POST'])
def add_ingredients(request):
    try: 
        if(request.method=='POST'):
            data=request.data['name']
            if (Inventory.objects.filter(name = data.upper()).exists()):
                return Response({"message":"Ingredient Already Found"})
            Inventory(name=(data.upper()),quantity=0).save()
        return Response({"message":"Ingredient Created"})
    except:
        # traceback.print_exc()
        return Response({"message":"can't create ingredients"})

def calculateThreshold(data):
    # print("ed")
    for item in data:
        ingredient_list, quantity_list, complementory_list = list(Food.objects.filter(pk = item[3]).values_list('ingredient_list_id', "quantity_list" ,"complementory_list"))[0]
        # print(ingredient_list, quantity_list, complementory_list)  
        ingredient_list = ingredient_list.split(',')
        quantity_list = quantity_list.split(',')
        if (complementory_list):
            for complement in complementory_list.split(','):
                temp = list(Food.objects.filter(pk = int(complement)).values_list('ingredient_list_id', "quantity_list"))[0]
                ingredient_list.extend(temp[0].split(','))
                quantity_list.extend(temp[1].split(','))
        
        for ingredient in range(len(ingredient_list)):
            if(DailyConsumption.objects.filter(ingredient_id = int(ingredient_list[ingredient]), date__exact=date.today()).exists()):
                temp = DailyConsumption.objects.get(ingredient_id = int(ingredient_list[ingredient]), date__exact=date.today())
                
                temp.quantity = float(temp.quantity) + float(item[1]) * float(quantity_list[ingredient])
                temp.save()
            else:
                DailyConsumption(ingredient_id = ingredient_list[ingredient], quantity = float(item[1]) * float(quantity_list[ingredient])).save()

            threshold = DailyConsumption.objects.filter(ingredient_id = int(ingredient_list[ingredient]), date__gte=((datetime.today() - timedelta(days=3)).strftime("%Y-%m-%d"))).values_list("quantity", flat=True)
            
            temp = Inventory.objects.get(ingredient_id = int(ingredient_list[ingredient]))
            temp.quantity = float(temp.quantity) - float(item[1]) * float(quantity_list[ingredient])
            temp.thresholdvalue = float(sum(threshold)*(2/3))
            l = set()
            if(temp.quantity < temp.thresholdvalue):
                l.add(temp.name)
                if PurchaseList.objects.filter(ingredient_name=temp.name).exists():
                    if PurchaseList.objects.filter(ingredient_name=temp.name , is_ordered = 1).exists():
                        ordered_list = PurchaseList.objects.get(ingredient_name=temp.name, is_ordered = 1)
                        
                        try:
                            purchase_list = PurchaseList.objects.get(ingredient_name=temp.name, is_ordered = 0)
                            purchase_list.amount = (temp.thresholdvalue - temp.quantity) - ordered_list.amount
                            purchase_list.save()
                        except:
                            # traceback.print_exc()
                            # print(ordered_list.amount)
                            PurchaseList(ingredient_name=temp.name, amount=((temp.thresholdvalue - temp.quantity) - ordered_list.amount)).save()
                    else:
                        purchase_list = PurchaseList.objects.get(ingredient_name=temp.name)
                        purchase_list.amount = temp.thresholdvalue - temp.quantity
                        purchase_list.save()
                else:
                    PurchaseList(ingredient_name=temp.name, amount=(temp.thresholdvalue - temp.quantity)).save()
                    # traceback.print_exc()
                    

            temp.save()
    return l

@api_view(['GET','POST'])
def get_purchase_list(request):
    if request.method == 'GET':
        try:
            #pur_list = my_custom_sql("select * from PurchaseList where is_ordered=0")
            pur_list = list(PurchaseList.objects.filter(is_ordered = 0).values_list())
            # print(pur_list)
            return Response(pur_list)
        except:
            # traceback.print_exc()
            return Response({"No list found"})
        #return Response({"No list found"})
    elif request.method == 'POST':
        try:
            #my_custom_sql("update PurchaseList set is_ordered=1")
            for i in PurchaseList.objects.filter(is_ordered = 0):
                #print(i.ingredient_name)
                if PurchaseList.objects.filter(ingredient_name=i.ingredient_name , is_ordered = 1).exists():
                    purchase_list = PurchaseList.objects.get(ingredient_name=i.ingredient_name, is_ordered = 1)
                    # print(purchase_list.ingredient_name)
                    purchase_list.amount += i.amount
                    purchase_list.save()
                    i.delete()
                else:
                    i.is_ordered = 1
                    i.save()
            return Response("")
        except:
            # traceback.print_exc()
            return Response("No list found")

global bill_no 
bill_no = 1
@api_view(["POST"])   
def bill_generator(request):
    try:
        global bill_no
        fs = FileSystemStorage()
        os.environ["INVOICE_LANG"] = "en"
        table_no = request.data["no"]
        client = Client('Table ' + str(table_no)) 
        clerk = request.data["email"]
        provider = Provider('Restaurant', bank_account='2600420569', bank_code='2010')
        creator = Creator(clerk)
        invoice = Invoice(client, provider, creator)
        
        data = request.data["order"] # quantity,price, name
        # print(data)
        invoice.currency_locale = 'en_IN'
        invoice.currency = "INR"
        invoice.number = bill_no
        balance = list(Variable.objects.all().values())[0]["balance"]
        bill_no += 1
        
        for item in data:
            invoice.add_item(Item(item[1], item[2]/item[1], description=item[0], tax=14))
            #my_custom_sql("insert into sales(item_code,quantity) values({},{})".format(int(item[3]),item[1]))
            Sales(item_code = Food.objects.get(item_code = int(item[3])), quantity = item[1]).save()
            balance += item[2]
            #print("select count(*) from sales where (item_code = {} && date >= {});".format(item[3], str((datetime.today() - timedelta(days=3)).strftime("%Y-%d,%Y"))))
            # count = my_custom_sql("select count(*) from sales where (item_code = {} && date >= {});".format(item[3], str((datetime.today() - timedelta(days=3)).strftime("%Y-%m-%d"))))[0][0]
                
        variable = Variable.objects.get(pk=1)
        variable.balance = balance
        variable.save()
        filename = "invoice"+str(bill_no)+".pdf"
        pdf = SimpleInvoice(invoice)
        pdf.gen(filename, generate_qr_code=True)
        t = Thread(target=calculateThreshold, args=(data,))
        t.start()
        
        if fs.exists(filename):
            with fs.open(filename) as pdf:
                response = HttpResponse(pdf, content_type='application/pdf')
                #response['Content-Disposition'] = 'attachment; filename="mypdf.pdf"' #user will be prompted with the browser’s open/save file
                response['Content-Disposition'] = 'inline; filename={}'.format(filename) #user will be prompted display the PDF in the browser
                return response
 
    except FileNotFoundError:
        raise Http404()    

def generate_check(to, price, filename):
    fontsize = 16
    font = ImageFont.truetype("arial.ttf", fontsize)
    BASE_DIR = getattr(settings, "BASE_DIR", None)
    today = date.today()
    d = today.strftime("%d")
    m = today.strftime("%m")
    y = today.strftime("%Y")
    price_word = nw(price).replace(",", "") + " only"
    acc_no = "1234567890"
    path = os.path.join(BASE_DIR,"images/cheque.png")
    
    sign_path = os.path.join(BASE_DIR,"images/signature.png")
    img = Image.open(path)
    d1 = ImageDraw.Draw(img)
    d1.text((488, 18), d[0], fill=(0,0,0))
    d1.text((503, 18), d[1], fill=(0,0,0))
    d1.text((518, 18), m[0], fill=(0,0,0))
    d1.text((533, 18), m[1], fill=(0,0,0))
    d1.text((548, 18), y[0], fill=(0,0,0))
    d1.text((563, 18), y[1], fill=(0,0,0))
    d1.text((578, 18), y[2], fill=(0,0,0))
    d1.text((593, 18), y[3], fill=(0,0,0))
    d1.text((100,52), to, font = font, fill=(0,0,0))
    d1.text((100,79), price_word, font = font, fill=(0,0,0))
    d1.text((80,136), acc_no, font = font, fill=(0,0,0))
    d1.text((500, 102), str(price),  font = font, fill =(0, 0, 0))
    signature = Image.open(sign_path)
    img.paste(signature, (450, 170))
    #img.show()
    img.save(filename)

global invoice_no
invoice_no = 1

@api_view(["POST"])
def get_Invoice(request):
    if(request.method=='POST'):
        """ balance = Variable.objects.get(id = 1)
        print(balance.balance) """
        data=request.data
        ingredientsList = data["nameList"]
        quantityList = data["quantityList"]
        #print(quantityList)
        priceList=data["priceList"]
        #ingredientsdict=dict(my_custom_sql("select name,ingredient_id from inventory"))
        ingredientsdict = dict(Inventory.objects.filter().values_list('name','ingredient_id'))
        # print(ingredientsdict)
        for i in range(0,len(ingredientsList)):
            ingredientsList[i] = str(ingredientsdict[ingredientsList[i]])
        """ balance=list(my_custom_sql("select balance from variable"))
        balance=list(itertools.chain(*balance)) """
        balance = Variable.objects.get(pk = 1)
        actbal=balance.balance
        ingredientsList=[int(i) for i in ingredientsList]
        quantityList=[float(i) for i in quantityList]
        #print(quantityList)
        priceList=[float(i) for i in priceList]
        # for index in range(len(priceList)):
        #     priceList[index]=(quantityList[index])*(priceList[index])
        gndprice=sum(priceList)
        # print(gndprice)
        if(gndprice>actbal):
            return Response("Insufficient balance")
        else:
            #print(ingredientsList)
            for i in range(len(ingredientsList)):
                ingred = Inventory.objects.get(pk=ingredientsList[i])
                new_purchase=Purchase(ingredient=ingred,quantity=quantityList[i],price=priceList[i],date=datetime.now())
                new_purchase.save()
                try:
                    purchase_list = PurchaseList.objects.get(ingredient_name=ingred.name, is_ordered = 1)
                    # print(purchase_list)
                    if (purchase_list.amount <= quantityList[i]):
                        purchase_list.delete()
                    else:
                        purchase_list.amount -= float(quantityList[i])
                        purchase_list.is_ordered = 0
                        purchase_list.save()
                except:
                    # traceback.print_exc()
                    pass
            actbal=actbal-gndprice
            #print(actbal)
            #my_custom_sql('update variable SET balance={}'.format(actbal))
            balance = Variable.objects.get(pk = 1)
            balance.balance = actbal
            balance.save()
            for i in range(len(ingredientsList)):
                #my_custom_sql('update inventory set quantity=quantity+{} where ingredient_id={}'.format(quantityList[i],ingredientsList[i]))
                inventory  = Inventory.objects.get(ingredient_id = int(ingredientsList[i]))
                #print(inventory)
                inventory.quantity = float(inventory.quantity) + quantityList[i]
                inventory.save()
            global invoice_no
            filename = "check" + str(invoice_no) + ".jpg"
            generate_check("supplier", gndprice, filename)
            invoice_no += 1
            try:
                with open(filename, "rb") as f:
                    return HttpResponse(f.read(), content_type="image/jpeg")
            except IOError:
                red = Image.new('RGBA', (1, 1), (255,0,0,0))
                response = HttpResponse(content_type="image/jpeg")
                red.save(response, "JPEG")
                return response

@api_view(['POST'])
def get_complement(request):
    # query = "select name from food where food.isvisible = 0"
    # result = list(my_custom_sql(query))
    result = list(Food.objects.filter(isvisible = 0).values_list('name'))
    result = [i[0] for i in result]
    #print(result)
    return Response(result)


@api_view(['POST'])
def get_Image(request):
    #print(request.data)
    image=request.FILES.get("image")
    name=str(request.FILES.get("name")).upper()
    #print(name)
    food_row=Food.objects.get(name=name)
    food_row.image=image
    food_row.save()
    return Response("success")

@api_view(['POST'])
def delete_food(request):
    if(request.method == 'POST'):
        current_foodname = request.data['name']
        try:
            food_row = Food.objects.get(name=current_foodname)
            food_row.delete()
            result = list(Food.objects.filter(isvisible = 1).values_list('item_code', 'name', 'price')[0])
            return Response(result)
        except:
            # traceback.print_exc()
            return Response("Try again later")
