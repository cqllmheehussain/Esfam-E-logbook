// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqz7f5A2YQulpNS-zLfcj6qjnuvVrNYkw",
  authDomain: "esfam-e-logbook.firebaseapp.com",
  projectId: "esfam-e-logbook",
  storageBucket: "esfam-e-logbook.firebasestorage.app",
  messagingSenderId: "531372922507",
  appId: "1:531372922507:web:b6c3e1394fa488c6fe268e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Show/Hide Sections
function showSection(sectionId) {
  document.querySelectorAll('section').forEach(section => {
    section.classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}

// Register Student
async function registerStudent() {
  const email = document.getElementById('studentEmail').value;
  const password = document.getElementById('studentPassword').value;
  const firstName = document.getElementById('studentFirstName').value;
  const lastName = document.getElementById('studentLastName').value;
  const matric = document.getElementById('studentMatric').value;
  const department = document.getElementById('studentDepartment').value;
  const company = document.getElementById('studentCompany').value;
  const companyAddress = document.getElementById('studentCompanyAddress').value;
  const photoFile = document.getElementById('studentPhoto').files[0];

  if (!photoFile) {
    showToast('Please upload a passport photo!', 'error');
    return;
  }

  showLoading();
  try {
    // Create user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Upload photo
    const storageRef = storage.ref(`students/${user.uid}/${photoFile.name}`);
    await storageRef.put(photoFile);
    const photoURL = await storageRef.getDownloadURL();

    // Save student data
    await db.collection('students').doc(user.uid).set({
      firstName,
      lastName,
      matric,
      department,
      company,
      companyAddress,
      photoURL
    });

    hideLoading();
    showToast('Student registered successfully!', 'success');
    showSection('login');
  } catch (error) {
    hideLoading();
    showToast(error.message, 'error');
  }
}

// Generate PDF
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add ESFAM University Header
  doc.setFontSize(18);
  doc.setTextColor(34, 139, 34); // Green color
  doc.text("ESFAM University - SIWES E-Logbook", 10, 10);

  // Add Student Profile
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Black color
  doc.text(`Name: ${document.getElementById('studentName').textContent}`, 10, 20);
  doc.text(`Matric Number: ${document.getElementById('studentMatricNumber').textContent}`, 10, 30);
  doc.text(`Department: ${document.getElementById('studentDepartmentName').textContent}`, 10, 40);
  doc.text(`Company: ${document.getElementById('studentCompanyName').textContent}`, 10, 50);

  // Add Photo
  const img = new Image();
  img.src = document.getElementById('studentPhotoPreview').src;
  doc.addImage(img, 'JPEG', 150, 10, 40, 40);

  // Add Activities Table
  doc.setFontSize(14);
  doc.setTextColor(34, 139, 34); // Green color
  doc.text("SIWES Activities", 10, 70);

  const activities = [];
  const rows = document.querySelectorAll('#activityTableBody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    activities.push({
      date: cells[0].textContent,
      unit: cells[1].textContent,
      skills: cells[2].textContent,
      activity: cells[3].textContent
    });
  });

  // Create Table Headers
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Black color
  doc.text("Date", 10, 80);
  doc.text("Unit of Post", 50, 80);
  doc.text("Skills Learned", 100, 80);
  doc.text("Activities", 150, 80);

  // Add Activities to PDF
  let y = 90;
  activities.forEach(activity => {
    doc.text(activity.date, 10, y);
    doc.text(activity.unit, 50, y);
    doc.text(activity.skills, 100, y);
    doc.text(activity.activity, 150, y);
    y += 10;
  });

  // Save PDF
  doc.save(`SIWES_Logbook_${document.getElementById('studentMatricNumber').textContent}.pdf`);
}