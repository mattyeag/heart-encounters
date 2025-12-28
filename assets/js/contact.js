
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupMessages();
  setupMaintenance();
  createSuccessModal();
});

function setupTabs() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;

      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      document.getElementById(tab).classList.add('active');
    });
  });
}

function setupMessages() {
  const messageForm = document.getElementById('contact-form');
  if (messageForm) {
    messageForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = messageForm.querySelector('#name').value.trim();
      const email = messageForm.querySelector('#email').value.trim();
      const message = messageForm.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }

      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Message:', message);

      sendForm(messageForm);
    });
  }
}

async function setupMaintenance() {
  const maintenanceForm = document.getElementById('maintenance-form');
  if (maintenanceForm) {
    maintenanceForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const tenantName = maintenanceForm.querySelector('#tenant-name').value.trim();
      const unitAddress = maintenanceForm.querySelector('#unit-address').value.trim();
      const issueDetails = maintenanceForm.querySelector('#maintenance-details').value.trim();

      if (!tenantName || !unitAddress || !issueDetails) {
        alert('Please fill in all required fields.');
        return;
      }

      console.log('Tenant Name:', tenantName);
      console.log('Unit Address:', unitAddress);
      console.log('Issue Details:', issueDetails);

      // Await sendForm so we can keep the UX consistent (button state handled there)
      await sendForm(maintenanceForm);
    });
  }
}

function createSuccessModal() {
  const modalHTML = `
    <div id="success-modal" class="modal-overlay" style="display:none;">
      <div class="modal-content">
        <div class="checkmark">✓</div>
        <p>Your message was submitted successfully! Thank you! You will be redirected shortly.</p>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}


  async function sendForm(formElement){
  const accessKey = JSON.parse(sessionStorage.getItem("CONFIG_DATA"))?.web3FormsKey;
  
  if(!accessKey){
    alert("Configuration error. Please call by phone. We are sorry for the inconvenience.");
    window.location.href = '/';
    return;
  }
  const submitBtn = formElement.querySelector('button[type="submit"]');
  const formData = new FormData(formElement);
  formData.append("access_key", accessKey);

  const originalText = submitBtn ? submitBtn.textContent : '';

  if (submitBtn) {
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      showSuccessModal(formElement);
    } else {

      //TODO: remove this forced success after setup of web3forms with the actual domain and key
      //show success for now. 
      showSuccessModal(formElement);

      // alert("Error: " + (data && data.message ? data.message : JSON.stringify(data)));
    }

  } catch (error) {
    console.error('sendForm error:', error);
    alert("Something went wrong. Please try again.");
  } finally {
    if (submitBtn) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}

function showSuccessModal(formElement) {
  const modal = document.getElementById('success-modal');
        if (modal) {
          modal.style.display = 'flex';
          formElement.reset();

          setTimeout(() => {
            modal.style.display = 'none';
            window.location.href = '/';
          }, 3000);
        }
}