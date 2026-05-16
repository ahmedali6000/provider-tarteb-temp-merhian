// export const order ={
//     client:{
//         name: 'Mohamed Saeed',
//         phone: '01550330997',
//         rate: 4,
//         image:'https://admin.tarteb.app/storage/members/1646416574337818.jpeg'
//     },
//     address: null,
//     price:'611 EGP',
//     phone_order:'01099602832',
//     google_map:'https://www.google.com/maps/place/Maadi+Metro+Station/@29.9603028,31.2554544,17z/data=!3m1!4b1!4m5!3m4!1s0x145847f41b672bd7:0x7357392bdd40f39b!8m2!3d29.9603028!4d31.2576431',
//     services:[
//         {
//             name:'Fix the landline signal',
//             count:1,
//             price:'35 EGP'
//         },
//         {
//             name:'Extend a wire inside the wall\'s pipe',
//             count:2,
//             price:'288 EGP'
//         }
//     ]
// }

// export const service_d = {
//     "id": 201,
//     "price": 150,
//     "rate": 5,
//     "name": "Install air conditioner external and internal units ((1.5/2.25 hp)",
//     "des": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
//     "youtube": "https://www.youtube.com/watch?v=sE1WRraxWPI",
//     "image": "http://10.0.2.2:8000/more_vec/empty_service.jpg",
//     "category_id":46,
//     "category_name":"Air Conditioning"
// }
export const countries = [
  { id: 'eg', name: 'مصر', code: '+20', flag: require('./../../assets/app/images/country/eg.png'), length: 10 },
  { id: 'ae', name: 'الإمارات', code: '+971', flag: require('./../../assets/app/images/country/uae.png'), length: 9 },
  { id: 'sa', name: 'السعودية', code: '+966', flag: require('./../../assets/app/images/country/sa.png'), length: 9 },
  { id: 'kw', name: 'الكويت', code: '+965', flag: require('./../../assets/app/images/country/ku.png'), length: 8 },
  
  { id: 'bh', name: 'البحرين', code: '+973', flag: require('./../../assets/app/images/country/bh.png'), length: 8 },
  // { id: 'ly', name: 'ليبيا', code: '+218', flag: require('./../../assets/app/images/country/lib.png'), length: 9 },
  // { id: 'dz', name: 'الجزائر', code: '+213', flag: require('./../../assets/app/images/country/gaz.png'), length: 9 },
  { id: 'ma', name: 'المغرب', code: '+212', flag: require('./../../assets/app/images/country/magh.png'), length: 9 },
  { id: 'sd', name: 'السودان', code: '+249', flag: require('./../../assets/app/images/country/sud.png'), length: 9 },
  { id: 'jo', name: 'الأردن', code: '+962', flag: require('./../../assets/app/images/country/or.png'), length: 9 },
];

export const validatePhoneNumber = (number, country) => {
  // تجاهل الصفر في البداية تلقائياً
  let cleanNumber = number;
  if (number.startsWith('0')) {
    cleanNumber = number.substring(1);
  }
  
  // التحقق من الطول بناءً على الدولة
  const isValid = cleanNumber.length === country.length;
  
  return {
    isValid,
    cleanNumber,
    error: isValid ? null : 'رقم الهاتف غير صحيح'
  };
};

