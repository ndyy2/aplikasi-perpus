/*Global Utils*/
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('id-ID', options);
};

/* Management data */
let data = {
  buku: JSON.parse(localStorage.getItem('buku')) || [],
  anggota: JSON.parse(localStorage.getItem('anggota')) || [],
  pinjam: JSON.parse(localStorage.getItem('pinjam')) || [],
  editingId: null, // add editing state
  editingMemberId: null
};

// Animasi Loading
const simulateLoading = (callback) => {
  setTimeout(callback, 1000);
}

const setLoading = (btnId, isLoading, defaultText, iconClass) => {
  const btn = document.getElementById(btnId);
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = `<i class="${iconClass}"></i> ${defaultText}`;
  }
}

// Data Inisiasi/dummy
if (data.buku.length === 0) {
  data.buku = [
    { id: 'b1', judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', tahun: 2005, status: 'Tersedia' },
    { id: 'b2', judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', tahun: 1980, status: 'Tersedia' },
    { id: 'b3', judul: 'Harry Potter', penulis: 'J.K. Rowling', tahun: 1997, status: 'Dipinjam' }
  ];
  data.anggota = [
    { id: 'm1', nama: 'Jenyfer', alamat: 'Pacitan', bergabung: '2025-02-15' },
    { id: 'm2', nama: 'Jejey', alamat: 'Pacitan', bergabung: '2025-03-15' }
  ];
  data.pinjam = [
    { id: 'p1', anggotaId: 'm1', bukuId: 'b3', tanggal: '2025-03-10', status: 'Dipinjam' }
  ];
  saveData();
}

//simpan
function saveData() {
  localStorage.setItem('buku', JSON.stringify(data.buku));
  localStorage.setItem('anggota', JSON.stringify(data.anggota));
  localStorage.setItem('pinjam', JSON.stringify(data.pinjam));
  updateUI();
}

//update UI
function updateUI() {
  renderBuku();
  renderAnggota();
  renderPinjam();
  updateDashboard();
  populateSelects();
}

function updateDashboard() {
  document.getElementById('stats-total-buku').innerText = data.buku.length;
  document.getElementById('stats-dipinjam').innerText = data.pinjam.filter(p => p.status === 'Dipinjam').length;
  document.getElementById('stats-anggota').innerText = data.anggota.length;
}

/* Navigasi */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
  document.getElementById('nav-' + pageId).classList.add('active');
}

/* Logika Buku */
function tambahBuku() {
  const judul = document.getElementById('judul').value;
  const penulis = document.getElementById('penulis').value;
  const tahun = document.getElementById('tahun').value;

  if (judul && penulis && tahun) {
    const isEdit = !!data.editingId;
    const btnId = 'btn-simpan';
    const defaultText = isEdit ? 'Simpan Perubahan' : 'Tambah Buku';
    const icon = isEdit ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-plus';

    setLoading(btnId, true);

    simulateLoading(() => {
      if (data.editingId) {
        // Logic Update
        const index = data.buku.findIndex(b => b.id === data.editingId);
        if (index !== -1) {
          data.buku[index] = { ...data.buku[index], judul, penulis, tahun };
          saveData();
          alert('Data buku berhasil diperbarui!');
          batalEdit(); // Reset form
        }
      } else {
        // Logic Tambah Baru
        data.buku.push({
          id: generateId(),
          judul,
          penulis,
          tahun,
          status: 'Tersedia'
        });
        saveData();
        alert('Buku berhasil ditambahkan!');

        document.getElementById('judul').value = '';
        document.getElementById('penulis').value = '';
        document.getElementById('tahun').value = '';
      }
      setLoading(btnId, false, defaultText, icon);
    });

  } else {
    alert('Mohon lengkapi data buku.');
  }
}

function batalEdit() {
  data.editingId = null;
  document.getElementById('judul').value = '';
  document.getElementById('penulis').value = '';
  document.getElementById('tahun').value = '';

  const btnSimpan = document.getElementById('btn-simpan');
  btnSimpan.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah Buku';

  document.getElementById('btn-batal').style.display = 'none';
}

function editBuku(id) {
  const buku = data.buku.find(b => b.id === id);
  if (buku) {
    document.getElementById('judul').value = buku.judul;
    document.getElementById('penulis').value = buku.penulis;
    document.getElementById('tahun').value = buku.tahun;

    data.editingId = id;
    const btnSimpan = document.getElementById('btn-simpan');
    btnSimpan.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
    document.getElementById('btn-batal').style.display = 'inline-block';

    document.querySelector('.form-group').scrollIntoView({ behavior: 'smooth' });
  }
}

function toggleMenu(id) {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    if (menu.id !== 'menu-' + id) menu.classList.remove('show');
  });

  const menu = document.getElementById('menu-' + id);
  if (menu) menu.classList.toggle('show');

  event.stopPropagation();
}

// Tutup menu saat klik di luar
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
});

function hapusBuku(id) {
  if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
    data.buku = data.buku.filter(b => b.id !== id);
    saveData();
    alert('Buku berhasil dihapus!');
  }
}

function renderBuku() {
  const tbody = document.getElementById('listBuku');
  tbody.innerHTML = '';
  data.buku.forEach((b, i) => {
    if (!b.status) b.status = 'Tersedia';

    let badgeClass = b.status === 'Tersedia' ? 'available' : 'borrowed';
    let btnDisabled = b.status === 'Dipinjam' ? 'disabled' : '';
    let btnStyle = b.status === 'Dipinjam' ? 'opacity: 0.5; cursor: not-allowed;' : '';

    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${b.judul}</td>
        <td>${b.penulis}</td>
        <td>${b.tahun}</td>
        <td><span class="badge ${badgeClass}">${b.status}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn-icon edit" onclick="editBuku('${b.id}')" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-icon delete" onclick="hapusBuku('${b.id}')" ${btnDisabled} style="${btnStyle}" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
      </tr>`;
  });
}

/*  Logika Anggota  */
function tambahAnggota() {
  const nama = document.getElementById('namaAnggota').value;
  const alamat = document.getElementById('alamat').value;

  if (nama && alamat) {
    const isEdit = !!data.editingMemberId;
    const btnId = 'btn-simpan-anggota';
    const defaultText = isEdit ? 'Simpan Perubahan' : 'Tambah Anggota';
    const icon = isEdit ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-user-plus';

    setLoading(btnId, true);

    simulateLoading(() => {
      if (data.editingMemberId) {
        // Logic Update
        const index = data.anggota.findIndex(a => a.id === data.editingMemberId);
        if (index !== -1) {
          data.anggota[index] = { ...data.anggota[index], nama, alamat };
          saveData();
          alert('Data anggota berhasil diperbarui!');
          batalEditAnggota();
        }
      } else {
        // Logic Tambah Baru
        data.anggota.push({
          id: generateId(),
          nama,
          alamat,
          bergabung: new Date().toISOString().split('T')[0]
        });
        saveData();
        alert('Anggota berhasil ditambahkan!');
        document.getElementById('namaAnggota').value = '';
        document.getElementById('alamat').value = '';
      }
      setLoading(btnId, false, defaultText, icon);
    });

  } else {
    alert('Mohon lengkapi data anggota.');
  }
}

function editAnggota(id) {
  const anggota = data.anggota.find(a => a.id === id);
  if (anggota) {
    document.getElementById('namaAnggota').value = anggota.nama;
    document.getElementById('alamat').value = anggota.alamat;

    data.editingMemberId = id;
    const btnSimpan = document.getElementById('btn-simpan-anggota');
    btnSimpan.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
    document.getElementById('btn-batal-anggota').style.display = 'inline-block';

    document.querySelector('#anggota .form-group').scrollIntoView({ behavior: 'smooth' });
  }
}

function batalEditAnggota() {
  data.editingMemberId = null;
  document.getElementById('namaAnggota').value = '';
  document.getElementById('alamat').value = '';

  const btnSimpan = document.getElementById('btn-simpan-anggota');
  btnSimpan.innerHTML = '<i class="fa-solid fa-user-plus"></i> Tambah Anggota';
  document.getElementById('btn-batal-anggota').style.display = 'none';
}

function hapusAnggota(id) {
  if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
    data.anggota = data.anggota.filter(a => a.id !== id);
    saveData();
    alert('Anggota berhasil dihapus!');
  }
}

function renderAnggota() {
  const tbody = document.getElementById('listAnggota');
  tbody.innerHTML = '';
  data.anggota.forEach((a, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${a.nama}</td>
        <td>${a.alamat}</td>
        <td>${formatDate(a.bergabung)}</td>
        <td>
            <div class="action-buttons">
                <button class="btn-icon edit" onclick="editAnggota('${a.id}')" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-icon delete" onclick="hapusAnggota('${a.id}')" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
      </tr>`;
  });
}

/*  Logika Peminjaman  */
function renderPinjam() {
  const tbody = document.getElementById('listPinjam');
  tbody.innerHTML = '';
  data.pinjam.forEach((p, i) => {
    const anggota = data.anggota.find(a => a.id === p.anggotaId);
    const buku = data.buku.find(b => b.id === p.bukuId);
    const badgeClass = p.status === 'Dipinjam' ? 'borrowed' : 'available';

    tbody.innerHTML += `
      < tr >
        <td>${i + 1}</td>
        <td>${anggota ? anggota.nama : 'Tidak Ditemukan'}</td>
        <td>${buku ? buku.judul : 'Tidak Ditemukan'}</td>
        <td>${formatDate(p.tanggal)}</td>
        <td><span class="badge ${badgeClass}">${p.status}</span></td>
        <td>
          ${p.status === 'Dipinjam' ? `<button class="btn-action" onclick="kembalikanBuku('${p.id}')">Kembalikan</button>` : '-'}
        </td>
      </tr > `;
  });
}

function populateSelects() {
  const selectAnggota = document.getElementById('pilihAnggota');
  const selectBuku = document.getElementById('pilihBuku');

  const currentAnggota = selectAnggota.value;
  const currentBuku = selectBuku.value;

  selectAnggota.innerHTML = '<option value="">-- Pilih Peminjam --</option>';
  data.anggota.forEach(a => {
    selectAnggota.innerHTML += `<option value="${a.id}">${a.nama}</option>`;
  });

  selectBuku.innerHTML = '<option value="">-- Pilih Buku --</option>';
  data.buku.filter(b => b.status === 'Tersedia').forEach(b => {
    selectBuku.innerHTML += `<option value="${b.id}">${b.judul}</option>`;
  });

  if (currentAnggota) selectAnggota.value = currentAnggota;
  if (currentBuku) selectBuku.value = currentBuku;
}

function tambahPinjam() {
  const anggotaId = document.getElementById('pilihAnggota').value;
  const bukuId = document.getElementById('pilihBuku').value;
  const tanggal = document.getElementById('tanggalPinjam').value;

  if (anggotaId && bukuId && tanggal) {
    const btnId = 'btn-simpan-pinjam';
    const defaultText = 'Simpan Peminjaman';
    const icon = 'fa-solid fa-file-signature';

    setLoading(btnId, true);

    simulateLoading(() => {
      // Update status buku
      const bookIndex = data.buku.findIndex(b => b.id === bukuId);
      if (bookIndex !== -1) {
        data.buku[bookIndex].status = 'Dipinjam';

        data.pinjam.push({
          id: generateId(),
          anggotaId,
          bukuId,
          tanggal,
          status: 'Dipinjam'
        });

        saveData();
        document.getElementById('pilihAnggota').value = '';
        document.getElementById('pilihBuku').value = '';
        document.getElementById('tanggalPinjam').value = '';
        alert('Peminjaman berhasil dicatat!');
      }
      setLoading(btnId, false, defaultText, icon);
    });

  } else {
    alert('Mohon lengkapi data peminjaman.');
  }
}

function kembalikanBuku(pinjamId) {
  const pinjamIndex = data.pinjam.findIndex(p => p.id === pinjamId);
  if (pinjamIndex !== -1) {
    const borrowing = data.pinjam[pinjamIndex];

    borrowing.status = 'Dikembalikan';

    //kembalikan status ke tersedia
    const bookIndex = data.buku.findIndex(b => b.id === borrowing.bukuId);
    if (bookIndex !== -1) {
      data.buku[bookIndex].status = 'Tersedia';
    }

    saveData();
    alert('Buku berhasil dikembalikan!');
  }
}

function renderPinjam() {
  const tbody = document.getElementById('listPinjam');
  tbody.innerHTML = '';

  const sortedPinjam = [...data.pinjam].sort((a, b) => (a.status === 'Dipinjam' ? -1 : 1));

  sortedPinjam.forEach(p => {
    const anggotaName = data.anggota.find(m => m.id === p.anggotaId)?.nama || 'Unknown';
    const bukuData = data.buku.find(b => b.id === p.bukuId);
    const bukuJudul = bukuData ? bukuData.judul : 'Unknown Book';

    let actionBtn = '';
    if (p.status === 'Dipinjam') {
      actionBtn = `<button class="secondary" onclick="kembalikanBuku('${p.id}')" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Kembalikan</button>`;
    }

    let badgeClass = p.status === 'Dipinjam' ? 'borrowed' : 'returned';

    tbody.innerHTML += `
      <tr>
        <td>${anggotaName}</td>
        <td>${bukuJudul}</td>
        <td>${formatDate(p.tanggal)}</td>
        <td><span class="badge ${badgeClass}">${p.status}</span></td>
        <td>${actionBtn}</td>
      </tr>`;
  });
}

updateUI();