export default function () {
     let today = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
     let date = new Date(today);
     let year = date.getFullYear();
     let month = String(date.getMonth()).padStart(2, '0');
     let day = String(date.getDate()).padStart(2, '0');

     let formattedDate = `${year}-${month}-${day}`;

     return formattedDate
}