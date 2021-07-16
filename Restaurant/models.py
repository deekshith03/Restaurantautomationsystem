#from django import db
from django.db import models
from django.db.models.query_utils import Q
from django.db.models.constraints import CheckConstraint
from django.core.validators import EmailValidator
#from datetime import datetime as dt
#from datetime import date


class Food(models.Model):
    item_code = models.AutoField(primary_key=True)
    ingredient_list_id = models.CharField(max_length=255, blank=True, null=True)
    quantity_list = models.CharField(max_length=255, blank=True, null=True)
    complementory_list = models.CharField(max_length=255, blank=True, null=True)
    price = models.IntegerField(blank=True, null=True, default = 0)
    name = models.CharField(db_column='NAME', max_length=20, blank=True, null=True)  # Field name made lowercase.
    isvisible = models.IntegerField(db_column='ISVISIBLE', choices=[(1, 'Yes'), (0, 'No')], blank=True, null=True, default=1)  # Field name made lowercase.
    image = models.ImageField(db_column = "Image", null = True, upload_to="images/")
    
    class Meta:
        db_table = 'Food'
        verbose_name_plural = 'Food'
        constraints = [
            CheckConstraint(
            check = Q(price__gte=0),
            name = 'price_chk_1'
        )
        ]


class Inventory(models.Model):
    ingredient_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=10, decimal_places=5, blank=True, null=True)
    thresholdvalue = models.DecimalField(max_digits=10, decimal_places=5, blank=True, null=True, default=2.0)

    class Meta:
        managed = True
        db_table = 'inventory'
        verbose_name_plural = 'inventory'
        ''' constraints = [
            CheckConstraint(
            check = Q(quantity_gte=0),
            name = 'quantity_chk_1'
        )
        ] '''


class Login(models.Model):
    email = models.CharField(primary_key=True, max_length=40, validators=[EmailValidator()])
    type = models.CharField(max_length=20, choices=[('Owner', 'Owner'), ('Manager','Manager'), ('Clerk', 'Clerk')], blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)
    Otp = models.CharField(max_length = 7, blank=True, null= True, default="")
    
    class Meta:
        managed = True
        db_table = 'login'
        verbose_name_plural = 'login'
          

class Sales(models.Model):
    item_code = models.ForeignKey(Food, models.DO_NOTHING, db_column='ITEM_CODE', blank=True, null=True)  # Field name made lowercase.
    quantity = models.IntegerField(db_column='QUANTITY', blank=True, null=True)  # Field name made lowercase.
    date = models.DateTimeField(auto_now = True, db_column='DATE', null=True)  # Field name made lowercase.
    id = models.AutoField(primary_key=True)
    class Meta:
        managed = True
        db_table = 'sales'
        verbose_name_plural = 'sales'
        ''' constraints = [ 
            CheckConstraint(
            check = Q(quantity__gte=0),
            name = 'quantity_chk_3'
        )
        ] '''

class Variable(models.Model):
    balance = models.FloatField(db_column='BALANCE', null = True)
    id = models.AutoField(primary_key=True)

    class Meta:
        managed = True
        db_table = 'Variable'
        verbose_name_plural = 'Variable'
        

class DailyConsumption(models.Model):
    id = models.AutoField(primary_key=True)
    ingredient_id = models.IntegerField(null=True)
    quantity = models.FloatField(null=True)
    date = models.DateField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'DailyConsumption'
        verbose_name_plural = 'DailyConsumption'

class PurchaseList(models.Model):
    id = models.AutoField(primary_key=True)
    ingredient_name = models.CharField(max_length=50)
    amount = models.FloatField(null=True)
    is_ordered = models.IntegerField(default=0)

    class Meta:
        managed = True
        db_table = 'PurchaseList'
        verbose_name_plural = 'PurchaseList'

class Purchase(models.Model):
    id = models.AutoField(primary_key = True)
    ingredient = models.ForeignKey(Inventory, models.DO_NOTHING, db_column='INGREDIENT_ID', null=True)  # Field name made lowercase.
    quantity = models.FloatField(db_column='QUANTITY', blank=True, null=True)  # Field name made lowercase.
    price = models.FloatField(db_column='PRICE', blank=True, null=True)  # Field name made lowercase.
    date = models.DateTimeField(auto_now = True, db_column='DATE')  # Field name made lowercase.
    

    class Meta:
        managed = True
        db_table = 'Purchase'
        verbose_name_plural = 'Purchase'