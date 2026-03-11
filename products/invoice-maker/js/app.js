document.addEventListener('DOMContentLoaded', () => {
      // Default dates
      const today = new Date();
      const due = new Date(); due.setDate(today.getDate() + 14);
      document.getElementById('invoice-date').valueAsDate = today;
      document.getElementById('due-date').valueAsDate = due;

      const $ = id => document.getElementById(id);
      let currency = 'R';

      const formatDate = s => s ? new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

      const updatePreview = () => {
        $('prev-company-name').textContent = $('company-name').value;
        $('prev-company-addr').innerHTML = $('company-address').value.replace(/\n/g, '<br>');
        $('prev-client-name').textContent = $('client-name').value;
        $('prev-client-addr').innerHTML = $('client-address').value.replace(/\n/g, '<br>');
        $('prev-inv-num').textContent = $('invoice-number').value;
        $('prev-ref').textContent = $('invoice-number').value;

        const invDate = $('invoice-date').value;
        $('prev-inv-date').textContent = formatDate(invDate);
        $('pw-date').style.display = invDate ? '' : 'none';

        const dueDate = $('due-date').value;
        $('prev-due-date').textContent = formatDate(dueDate);
        $('pw-due').style.display = dueDate ? '' : 'none';

        // Payment
        const bank = $('bank-name').value;
        const acname = $('account-name').value;
        const acnum = $('account-number').value;
        const branch = $('branch-code').value;
        $('prev-bank').textContent = bank;
        $('prev-acname').textContent = acname;
        $('prev-acnum').textContent = acnum;
        $('prev-branch').textContent = branch;
        $('pd-bank').style.display = bank ? '' : 'none';
        $('pd-acname').style.display = acname ? '' : 'none';
        $('pd-acnum').style.display = acnum ? '' : 'none';
        $('pd-branch').style.display = branch ? '' : 'none';
        $('payment-section').style.display = (bank || acname || acnum) ? '' : 'none';

        // Items
        let total = 0;
        $('prev-items').innerHTML = '';
        document.querySelectorAll('#items-body tr').forEach(row => {
          const desc = row.querySelector('.item-desc').value;
          const amt = parseFloat(row.querySelector('.item-amt').value) || 0;
          total += amt;
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${desc || '—'}</td><td>${currency}${amt.toFixed(2)}</td>`;
          $('prev-items').appendChild(tr);
        });

        $('prev-total').textContent = total.toFixed(2);
        $('prev-currency').textContent = currency;
      };

      const addItem = (desc = '', amt = '') => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td><input type="text" class="item-desc" placeholder="Description" value="${desc}"></td>
      <td><input type="number" class="item-amt" placeholder="0.00" step="0.01" value="${amt}"></td>
      <td><button class="btn-remove" title="Remove">✕</button></td>
    `;
        $('items-body').appendChild(row);
        row.querySelectorAll('input').forEach(i => i.addEventListener('input', updatePreview));
        row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); updatePreview(); });
      };

      const generatePdf = () => {
        const el = $('invoice-preview');
        html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgData = canvas.toDataURL('image/png');
          const w = 210, h = canvas.height * w / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, w, h);
          pdf.save(`${$('invoice-number').value || 'Invoice'}.pdf`);
        });
      };

      // Bind inputs
      ['company-name', 'company-address', 'client-name', 'client-address',
        'invoice-number', 'invoice-date', 'due-date',
        'bank-name', 'account-name', 'account-number', 'branch-code']
        .forEach(id => $(id).addEventListener('input', updatePreview));

      $('add-item').addEventListener('click', () => addItem());
      $('pdf-desktop-btn').addEventListener('click', generatePdf);
      $('pdf-mobile-btn').addEventListener('click', generatePdf);

      // Currency pills
      document.querySelectorAll('input[name="currency"]').forEach(r => {
        r.addEventListener('change', () => {
          currency = r.value;
          document.querySelectorAll('.currency-pills label').forEach(l => l.classList.remove('active'));
          r.closest('label').classList.add('active');
          updatePreview();
        });
      });

      // Accent color
      $('accent-color').addEventListener('input', e => {
        document.documentElement.style.setProperty('--primary', e.target.value);
        // Lighten for primary-light
        document.documentElement.style.setProperty('--primary-light', e.target.value + '22');
      });

      // Mobile navigation
      $('preview-btn-mobile').addEventListener('click', () => {
        document.body.classList.add('preview-active');
        window.scrollTo(0, 0);
      });
      $('back-btn').addEventListener('click', () => {
        document.body.classList.remove('preview-active');
        window.scrollTo(0, 0);
      });

      // Init
      addItem('Mobile App Development (Android)', 6500);
      addItem('Database Maintenance & Backup', 1250);
      addItem('Domain Registration (1 Year)', 200);
      updatePreview();
    });