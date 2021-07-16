from django.contrib import admin
from .models import *

class FoodAdmin(admin.ModelAdmin):
    list_display = ('item_code','ingredient_list_id', 'quantity_list', 'complementory_list', 'price', 'name', 'isvisible', 'image')

class LoginAdmin(admin.ModelAdmin):
    list_display = ('email', 'type', 'password','Otp')

class PurchaseAdmin(admin.ModelAdmin):
   list_display = ('ingredient', 'quantity', 'price', 'date', 'id')
    
class SalesAdmin(admin.ModelAdmin):
    list_display = ('id','item_code', 'quantity', 'date')

class InventoryAdmin(admin.ModelAdmin):
    list_display = ('ingredient_id', 'name', 'quantity', 'thresholdvalue')

class VariableAdmin(admin.ModelAdmin):
    list_display = ('balance','id')

class DailyConsumptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'ingredient_id', 'quantity', 'date')

class PurchaseListAdmin(admin.ModelAdmin):
    list_display = ('id', 'ingredient_name', 'amount', "is_ordered")
    
# Register your models here.

admin.site.register(Food, FoodAdmin)
admin.site.register(Login, LoginAdmin)
admin.site.register(Purchase, PurchaseAdmin)
admin.site.register(Sales, SalesAdmin)
admin.site.register(Inventory, InventoryAdmin)
admin.site.register(Variable, VariableAdmin)
admin.site.register(DailyConsumption, DailyConsumptionAdmin)
admin.site.register(PurchaseList, PurchaseListAdmin)