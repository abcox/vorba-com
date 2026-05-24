export const environment = {
  name: 'Production',
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',  // DEPRECATED
  backendApiUrl: 'https://demo-app5-api.azurewebsites.net',
  // fileServiceApiUrl: 'https://vorba-file-service-4.canadaeast.azurecontainer.io',
  fileServiceApiUrl: 'https://vorba-file-service-3.azurewebsites.net',
  stripePublicKey: 'pk_live_51SH85qLm8WjfqU8oOlnYytr1tRgEj0Bf6XeuyzzxfTPIE38zJPl10nkKo0qr2XWwS7Yyrjw64zzQqccpHJBqwiy100UtQ8vAXg', // live key

/* TODO: Make endpoint in the API that will fetch the personalized data for this site, meanwhile
   Use this area to make personal object for filling data */
   profiles: [
    {
      name: 'Vorba Corporation',
      title: 'Innovating the Future of Technology',
      photoUrl: 'https://media.licdn.com/dms/image/C4D03AQH8n9sXo2l7w/profile-displayphoto-shrink_400_400/0/1517014417693?e=1701302400&v=beta&t=5m1j6h8ZtqjKkJr2a9n1u9sXoQy7z5c5g5g5g5g5g',
      socialMediaLinks: {
        github: 'https://github.com/abcox/',
        linkedin: 'https://www.linkedin.com/company/vorba-corporation',
        twitter: 'https://twitter.com/vorbacorp',
        facebook: 'https://www.facebook.com/vorbacorp',
        instagram: 'https://www.instagram.com/vorbacorp/',
        tiktok: 'https://www.tiktok.com/@vorbacorp',
        youtube: 'https://www.youtube.com/@vorbacorp'
      }
    },    
    {
      name: 'Adam Cox',
      title: 'Founder & CEO',
      photoUrl: 'https://media.licdn.com/dms/image/C4D03AQH8n9sXo2l7w/profile-displayphoto-shrink_400_400/0/1517014417693?e=1701302400&v=beta&t=5m1j6h8ZtqjKkJr2a9n1u9sXoQy7z5c5g5g5g5g5g',
      socialMediaLinks: {
        github: 'https://github.com/abcox/',
        linkedin: 'https://www.linkedin.com/in/adamcox27/',
        twitter: 'https://twitter.com/bainton',
        facebook: 'https://www.facebook.com/adamcox27',
        instagram: 'https://www.instagram.com/adamcox27/',
        tiktok: 'https://www.tiktok.com/@adamcox27',
        youtube: 'https://www.youtube.com/@adamcox1783'
      }
    }
  ]
};
