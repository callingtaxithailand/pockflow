export function initProfileModule() {
  const trigger = document.getElementById('profile-image-trigger');
  const fileInput = document.getElementById('profile-file-input');

  if(trigger && fileInput) {
    trigger.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleProfileImageChange);
  }

  loadSavedProfileImage();
}

function handleProfileImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Image = e.target.result;
    localStorage.setItem('pflow_profile_avatar', base64Image);
    document.getElementById('profile-detail-img').src = base64Image;
    document.getElementById('nav-profile-img').src = base64Image;
  };
  reader.readAsDataURL(file);
}

function loadSavedProfileImage() {
  const savedAvatar = localStorage.getItem('pflow_profile_avatar');
  if (savedAvatar) {
    if (document.getElementById('profile-detail-img')) document.getElementById('profile-detail-img').src = savedAvatar;
    if (document.getElementById('nav-profile-img')) document.getElementById('nav-profile-img').src = savedAvatar;
  }
}
