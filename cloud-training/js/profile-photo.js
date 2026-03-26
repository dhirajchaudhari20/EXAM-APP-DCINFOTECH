// Profile Photo Upload with ImgBB API
(function () {
    const IMGBB_API_KEY = '3bc6dafa7ecd7c01a118fad187d32ca5';
    const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

    function initProfilePhotoUpload() {
        const photoInput = document.getElementById('dashboardProfilePhotoInput');
        const photoImg = document.getElementById('dashboardProfilePhoto');
        const photoContainer = document.getElementById('dashboardPhotoContainer');

        if (!photoInput || !photoImg) {
            console.warn('Profile photo elements not found');
            return;
        }

        // Load saved profile photo from localStorage
        const savedPhotoUrl = localStorage.getItem('userProfilePhoto');
        if (savedPhotoUrl) {
            photoImg.src = savedPhotoUrl;
        }

        // Create loader overlay
        let loaderOverlay = document.createElement('div');
        loaderOverlay.className = 'profile-upload-loader';
        loaderOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10;
        `;
        loaderOverlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div class="spinner-circle" style="width: 30px; height: 30px; margin: 0 auto 8px;"></div>
                <div style="font-size: 11px;">Uploading...</div>
            </div>
        `;

        // Ensure container has position relative
        if (photoContainer) {
            photoContainer.style.position = 'relative';
            photoContainer.appendChild(loaderOverlay);
        }

        // Handle file selection
        photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                if (typeof Notiflix !== 'undefined') {
                    Notiflix.Notify.failure('Please select an image file');
                } else {
                    alert('Please select an image file');
                }
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                if (typeof Notiflix !== 'undefined') {
                    Notiflix.Notify.failure('Image size should be less than 5MB');
                } else {
                    alert('Image size should be less than 5MB');
                }
                return;
            }

            // Show loader
            loaderOverlay.style.display = 'flex';

            try {
                // Prepare form data
                const formData = new FormData();
                formData.append('image', file);
                formData.append('key', IMGBB_API_KEY);

                // Upload to ImgBB
                const response = await fetch(IMGBB_UPLOAD_URL, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    const imageUrl = result.data.url;

                    // Update profile photo
                    photoImg.src = imageUrl;

                    // Save to localStorage
                    localStorage.setItem('userProfilePhoto', imageUrl);

                    // Show success message
                    if (typeof Notiflix !== 'undefined') {
                        Notiflix.Notify.success('Profile photo updated successfully!');
                    } else {
                        alert('Profile photo updated successfully!');
                    }
                } else {
                    throw new Error(result.error?.message || 'Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                if (typeof Notiflix !== 'undefined') {
                    Notiflix.Notify.failure('Failed to upload photo. Please try again.');
                } else {
                    alert('Failed to upload photo. Please try again.');
                }
            } finally {
                // Hide loader
                loaderOverlay.style.display = 'none';
                // Clear input value so same file can be selected again
                photoInput.value = '';
            }
        });
    }

    // Run immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfilePhotoUpload);
    } else {
        // DOM is already loaded
        initProfilePhotoUpload();
    }
})();
