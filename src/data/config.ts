export const setup = {
  fixedFees: 0.01,
  maxDiscount: 10,
  firstOrderDiscount: 10,
  orderLimit: 5000,
  profit: 0.05
}

export const randomColors = [
  {id: 0, name: 'red'},
  {id: 1, name: 'green'},
  {id: 2, name: 'blue'},
  {id: 3, name: 'pink'},
  {id: 4, name: 'yellow'},
  {id: 5, name: 'orange'},
  {id: 6, name: 'purple'},
  {id: 7, name: 'deeppurple'},
  {id: 8, name: 'lightblue'},
  {id: 9, name: 'teal'},
]

export const sortByList = [
  {id: 'p', name: 'اﻷقل سعرا'},
  {id: 's', name: 'اﻷكثر مبيعا'},
  {id: 'r', name: 'اﻷفضل في التقييم'},
  {id: 'o', name: 'العروض أولا'},
  {id: 'v', name: 'اﻷفضل قيمة (السعر/الوزن)'},
]

export const orderStatus = [
  {id: 'n', name: 'قيد الموافقة'},
  {id: 'a', name: 'تمت الموافقة'},
  {id: 's', name: 'معلق'},
  {id: 'r', name: 'مرفوض'},
  {id: 'e', name: 'قيد التنفيذ'},
  {id: 'f', name: 'تم التنفيذ'},
  {id: 'p', name: 'جاهز'},
  {id: 'd', name: 'مستلم'},
  {id: 'c', name: 'ملغي'},
  {id: 'u', name: 'غير متوفر'},
  {id: 'i', name: 'استيداع'},
  {id: 'm', name: 'مدمج'}
]  

export const orderPackStatus = [
  {id: 'n', name: 'قيد الشراء'},
  {id: 'p', name: 'شراء جزئي'},
  {id: 'f', name: 'تم الشراء'},
  {id: 'u', name: 'غير متوفر'},
  {id: 'pu', name: 'شراء جزئي والباقي غير متوفر'},
  {id: 'r', name: 'مرتجع'},
  {id: 'pr', name: 'مرتجع جزئي'}
]

export const alarmTypes = [
  {id: 'cp', name: 'الابلاغ عن تغيير السعر', isAvailable: 1},
  {id: 'av', name: 'الابلاغ عن توفر هذا المنتج/العرض', isAvailable: -1},
  {id: 'ua', name: 'الابلاغ عن عدم توفر هذا المنتج/العرض', isAvailable: 1},
  {id: 'aa', name: 'الابلاغ عن توفر بديل', isAvailable: 0},
  {id: 'eo', name: 'الابلاغ عن عرض لقرب انتهاء الصلاحية', isAvailable: 0},
  {id: 'go', name: 'الابلاغ عن عرض لمجموعة', isAvailable: 0},
]

export const storeSummary = [
  {id: 'a', name: 'كل المنتجات'},
  {id: 'o', name: 'منتجات اعلى من السوق'},
  {id: 'n', name: 'منتجات مساوية للسوق'},
  {id: 'l', name: 'منتجات أقل سعر في السوق'}
]

export const friendStatus = [
  {id: 'n', name: 'قيد الموافقة'},
  {id: 's', name: 'ارسلت الدعوة'},
  {id: 'o', name: 'مدعو سابقا'},
  {id: 'r', name: 'مستخدم فعلي'}
]

export const colors = [
  {id: 0, name: 'darkblue'},
  {id: 1, name: 'deeppink'},
  {id: 2, name: 'darkgreen'},
  {id: 3, name: 'red'},
  {id: 4, name: 'purple'},
  {id: 5, name: 'maroon'},
  {id: 6, name: 'darkslategray'},
  {id: 7, name: 'crimson'},
  {id: 8, name: 'chocolate'},
  {id: 9, name: 'darkolivegreen'},
]

export const patterns = {
  password: /^.{4}$/,
  name: /^.{3,50}$/,
  mobile: /^07[7-9][0-9]{7}$/
}