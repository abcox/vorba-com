export const environment = {
  name: 'Development (Local)',
  production: false,
  //apiUrl: 'http://localhost:3000/api'  // Adjust this to match your backend URL
  backendApiUrl: 'http://localhost:5000',
  fileServiceApiUrl: 'http://localhost:3000',
  stripePublicKey: 'pk_test_51SH85qLm8WjfqU8oW0UYIndRc4g7mSc5SGjggQfHvCiHxKERIEucNmSCi6nF5O0O3yQYt7ROs38yNhhmNo1im7Hw00dWG5YtyY', // test key

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
