'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ActionForm } from '@/components/admin-panel/action-form';
import { SubmitButton } from '@/components/admin-panel/submit-button';
import { UserPlus, ChevronDown, ChevronUp, X, Plus, Loader2, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface RegisterFormProps {
  action: (prev: any, fd: FormData) => Promise<any>;
  daerahList: { id: string; nama: string }[];
  desaList: { id: string; nama: string }[];
  kelompokList: { id: string; nama: string }[];
}

const Sel = ({ name, children, ...props }: any) => (
  <select
    name={name}
    className='h-10 w-full rounded-md border bg-background px-3 text-sm'
    {...props}
  >
    {children}
  </select>
);

interface SearchableSelectProps {
  fieldName: string;
  label: string;
  options: { id: string; nama: string }[];
  onSelect?: (id: string, nama: string) => void;
  valueId?: string;
  valueName?: string;
  placeholder?: string;
  table?: string;
  parentId?: string;
}

const SearchableSelect = ({
  fieldName,
  label,
  options,
  onSelect,
  valueId,
  valueName,
  placeholder = 'Cari...',
  table,
  parentId,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);

  const displayValue = search || (valueName || '');
  const filtered = options.filter((opt) =>
    opt.nama.toLowerCase().includes(search.toLowerCase())
  );

  const canAdd = table && search.trim().length > 1 && !options.some(
    o => o.nama.toLowerCase() === search.trim().toLowerCase()
  );

  const handleClear = () => {
    setSearch('');
    onSelect?.('', '');
  };

  async function addNew() {
    const trimmed = search.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      const payload: any = { table, nama: trimmed };
      if (parentId) payload.parentId = parentId;
      const res = await fetch('/api/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok && data.message !== 'Sudah ada.') throw new Error(data.message);
      onSelect?.(data.id, trimmed);
      toast.success(trimmed + ' berhasil ditambahkan!');
      setSearch('');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className='space-y-1'>
      <label className='text-xs text-muted-foreground'>{label}</label>
      <div className='relative'>
        {/* Hidden field untuk nilai yang dikirim ke server */}
        <input type='hidden' name={fieldName} value={valueName || ''} />
        <div className='flex items-center h-10 rounded-md border bg-background px-3 gap-2'>
          <input
            type='text'
            placeholder={placeholder}
            value={displayValue}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!e.target.value) onSelect?.('', '');
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className='flex-1 bg-transparent outline-none text-sm'
          />
          {valueName && (
            <button type='button' onClick={handleClear} className='text-muted-foreground hover:text-foreground'>
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
        {isOpen && (
          <div className='absolute top-full left-0 right-0 mt-1 border rounded-md bg-background shadow-md z-50 max-h-48 overflow-y-auto'>
            {filtered.map((opt) => (
              <button
                key={opt.id}
                type='button'
                onClick={() => {
                  onSelect?.(opt.id, opt.nama);
                  setSearch('');
                  setIsOpen(false);
                }}
                className='w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0'
              >
                {opt.nama}
              </button>
            ))}
            {filtered.length === 0 && !canAdd && (
              <p className='px-3 py-4 text-center text-xs text-muted-foreground'>Tidak ditemukan</p>
            )}
            {canAdd && (
              <button
                type='button'
                onClick={addNew}
                disabled={adding}
                className='flex w-full items-center gap-2 px-3 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors'
              >
                {adding ? <Loader2 className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
                Tambah &ldquo;{search.trim()}&rdquo;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export function RegisterMemberForm({
  action,
  daerahList,
  desaList,
  kelompokList,
}: RegisterFormProps) {
  const [showExtra, setShowExtra] = useState(false);

  const [daerahId, setDaerahId] = useState('');
  const [daerahNama, setDaerahNama] = useState('');
  const [desaId, setDesaId] = useState('');
  const [desaNama, setDesaNama] = useState('');
  const [kelompokId, setKelompokId] = useState('');
  const [kelompokNama, setKelompokNama] = useState('');

  const [filteredDesa, setFilteredDesa] = useState<{ id: string; nama: string }[]>(desaList || []);
  const [filteredKelompok, setFilteredKelompok] = useState<{ id: string; nama: string }[]>(kelompokList || []);

  // Sambung states — auto-fill from Asal
  const [sambungDaerahId, setSambungDaerahId] = useState('');
  const [sambungDaerahNama, setSambungDaerahNama] = useState('');
  const [sambungDesaId, setSambungDesaId] = useState('');
  const [sambungDesaNama, setSambungDesaNama] = useState('');
  const [sambungKelompokId, setSambungKelompokId] = useState('');
  const [sambungKelompokNama, setSambungKelompokNama] = useState('');
  const [sambungFilteredDesa, setSambungFilteredDesa] = useState<{ id: string; nama: string }[]>(desaList || []);
  const [sambungFilteredKelompok, setSambungFilteredKelompok] = useState<{ id: string; nama: string }[]>(kelompokList || []);
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const photoFileRef = useRef<File | null>(null);

  // Auto-upload setelah member berhasil dibuat
  useEffect(() => {
    if (createdProfileId && photoFileRef.current) {
      (async () => {
        setUploading(true);
        const fd = new FormData();
        fd.append("photo", photoFileRef.current!);
        fd.append("profileId", createdProfileId);
        fd.append("type", "fotoProfil");
        try { const r = await fetch("/api/admin/members/upload-photo", { method: "POST", body: fd }); const d = await r.json(); if (d.ok) toast.success("Foto profil berhasil diupload!"); else toast.error(d.message || "Gagal upload"); } catch { toast.error("Gagal upload"); }
        setUploading(false);
      })();
    }
  }, [createdProfileId]);

  // Auto-fill sambung dari asal
  useEffect(() => { setSambungDaerahId(daerahId); setSambungDaerahNama(daerahNama); }, [daerahId, daerahNama]);
  useEffect(() => {
    if (sambungDaerahId) {
      fetch("/api/admin/desa?daerahId=" + sambungDaerahId)
        .then(r => r.json()).then(d => setSambungFilteredDesa(Array.isArray(d) ? d : [])).catch(() => setSambungFilteredDesa([]));
      setSambungDesaId(desaId); setSambungDesaNama(desaNama);
    } else setSambungFilteredDesa(desaList || []);
  }, [sambungDaerahId]);
  useEffect(() => {
    if (sambungDesaId) {
      fetch("/api/admin/kelompok?desaId=" + sambungDesaId)
        .then(r => r.json()).then(d => setSambungFilteredKelompok(Array.isArray(d) ? d : [])).catch(() => setSambungFilteredKelompok([]));
      setSambungKelompokId(kelompokId); setSambungKelompokNama(kelompokNama);
    } else if (sambungDaerahId) setSambungFilteredKelompok([]);
    else setSambungFilteredKelompok(kelompokList || []);
  }, [sambungDesaId]);

  useEffect(() => {
    if (daerahId) {
      fetch("/api/admin/desa?daerahId=" + daerahId)
        .then((r) => r.json())
        .then((data) => setFilteredDesa(Array.isArray(data) ? data : []))
        .catch(() => setFilteredDesa([]));
      setDesaId("");
      setDesaNama("");
      setKelompokId("");
      setKelompokNama("");
      setFilteredKelompok([]);
    } else {
      setFilteredDesa(desaList || []);
      setFilteredKelompok(kelompokList || []);
    }
  }, [daerahId]);

  useEffect(() => {
    if (desaId) {
      fetch("/api/admin/kelompok?desaId=" + desaId)
        .then((r) => r.json())
        .then((data) => setFilteredKelompok(Array.isArray(data) ? data : []))
        .catch(() => setFilteredKelompok([]));
      setKelompokId("");
      setKelompokNama("");
    } else if (daerahId) {
      setFilteredKelompok([]);
    } else {
      setFilteredKelompok(kelompokList || []);
    }
  }, [desaId]);

  return (
    <div>
    <ActionForm action={action} resetOnSuccess onSuccess={(s) => {
      if (s && s.profileId) setCreatedProfileId(s.profileId);
      // Reset preview — ref file tetap hidup sampai useEffect upload
      setPhotoPreview(null);
      // Reset cascading asal
      setDaerahId(""); setDaerahNama("");
      setDesaId(""); setDesaNama("");
      setKelompokId(""); setKelompokNama("");
      setFilteredDesa(desaList || []);
      setFilteredKelompok(kelompokList || []);
      // Reset sambung
      setSambungDaerahId(""); setSambungDaerahNama("");
      setSambungDesaId(""); setSambungDesaNama("");
      setSambungKelompokId(""); setSambungKelompokNama("");
      setSambungFilteredDesa(desaList || []);
      setSambungFilteredKelompok(kelompokList || []);
      // Reset lainnya
      setShowExtra(false);
    }} className='space-y-4'>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>Nama Lengkap *</label>
          <Input name='namaLengkap' required />
        </div>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>Jenis Kelamin *</label>
          <Sel name='jenisKelamin' required>
            <option value=''>Pilih...</option>
            <option value='IKHWAN'>Laki-Laki</option>
            <option value='AKHWAT'>Perempuan</option>
          </Sel>
        </div>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>Tanggal Lahir *</label>
          <Input name='tanggalLahir' type='date' required />
        </div>

        <SearchableSelect
          fieldName='asalDaerah'
          label='Asal Daerah'
          options={daerahList}
          valueId={daerahId}
          valueName={daerahNama}
          onSelect={(id, nama) => { setDaerahId(id); setDaerahNama(nama); }}
          placeholder='Cari daerah...'
          table='Daerah'
        />
        <SearchableSelect
          fieldName='asalDesa'
          label='Asal Desa'
          options={filteredDesa}
          valueId={desaId}
          valueName={desaNama}
          onSelect={(id, nama) => { setDesaId(id); setDesaNama(nama); }}
          placeholder={daerahId ? 'Cari desa...' : 'Pilih daerah dulu'}
          table='Desa'
          parentId={daerahId}
        />
        <SearchableSelect
          fieldName='asalKelompok'
          label='Asal Kelompok'
          options={filteredKelompok}
          valueId={kelompokId}
          valueName={kelompokNama}
          onSelect={(id, nama) => { setKelompokId(id); setKelompokNama(nama); }}
          placeholder={desaId ? 'Cari kelompok...' : 'Pilih desa dulu'}
          table='Kelompok'
          parentId={desaId}
        />

        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>No. HP *</label>
          <Input name='nomorHp' type='tel' required />
        </div>
        <div className='space-y-1'>
          <label className='text-xs text-muted-foreground'>Instagram</label>
          <Input name='instagram' placeholder='tanpa @' />
        </div>
      </div>

      {/* ── Upload Foto ── */}
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 bg-white">
          {photoPreview ? (
            <img src={photoPreview} className="h-full w-full object-cover" alt="" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300"><ImageIcon className="h-6 w-6" /></div>
          )}
          {uploading && <div className="absolute inset-0 flex items-center justify-center bg-white/60"><Loader2 className="h-5 w-5 animate-spin text-emerald-600" /></div>}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-700">Foto Profil (opsional)</p>
          <p className="text-xs text-gray-400">Upload otomatis setelah member dibuat</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-4 py-2 text-xs font-bold hover:bg-gray-50">
          <Upload className="h-3.5 w-3.5" /> {photoFileRef.current ? "Ganti" : "Pilih"}
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0]; if (f) { photoFileRef.current = f; const r = new FileReader(); r.onload = ev => setPhotoPreview(ev.target?.result as string); r.readAsDataURL(f); } e.target.value = "";
          }} />
        </label>
        {photoFileRef.current && !uploading && (
          <button type="button" onClick={() => { photoFileRef.current = null; setPhotoPreview(null); }} className="text-xs text-red-500 font-bold">✕</button>
        )}
      </div>

      {/* ── Toggle Pendaftaran Lengkap ── */}
      <button
        type='button'
        onClick={() => setShowExtra((v) => !v)}
        className='flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors py-1'
      >
        {showExtra ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        {showExtra ? 'Sembunyikan Data Lengkap' : 'Tambahkan Data Lengkap (opsional)'}
      </button>

      {showExtra && (
        <div className='rounded-xl border bg-muted/20 p-4 space-y-4'>
          <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
            Data Tambahan â€" Semua Opsional
          </p>

          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='space-y-1'>
              <label className='text-xs text-muted-foreground'>Status Mubaligh</label>
              <Sel name='statusMubaligh'>
                <option value=''>-</option>
                <option value='Mubaligh'>Mubaligh</option>
                <option value='Non Mubaligh'>Non Mubaligh</option>
              </Sel>
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-muted-foreground'>Pendidikan Terakhir</label>
              <Input name='pendidikanTerakhir' placeholder='SD / SMA / S1...' />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-muted-foreground'>Status Pernikahan</label>
              <Sel name='statusPernikahan'>
                <option value='Lajang'>Lajang</option>
                <option value='Duda/Janda'>Duda/Janda</option>
              </Sel>
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-muted-foreground'>Pekerjaan</label>
              <Input name='pekerjaan' />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-muted-foreground'>Anak Ke</label>
              <Input name='anakKe' type='number' min='1' />
            </div>
            <div className='space-y-1'>
              <label className='text-xs text-muted-foreground'>Jumlah Saudara</label>
              <Input name='jumlahSaudara' type='number' min='0' />
            </div>
          </div>

          {/* ── Daerah Sambung ── */}
          <div>
            <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2'>Daerah Sambung</p>
            <div className='grid gap-3 sm:grid-cols-3'>
              <SearchableSelect
                fieldName='daerahSambung'
                label='Daerah Sambung'
                options={daerahList}
                valueId={sambungDaerahId}
                valueName={sambungDaerahNama}
                onSelect={(id, nama) => {
                  setSambungDaerahId(id);
                  setSambungDaerahNama(nama);
                }}
                placeholder='Cari daerah...'
                table='Daerah'
              />
              <SearchableSelect
                fieldName='desaSambung'
                label='Desa Sambung'
                options={sambungFilteredDesa}
                valueId={sambungDesaId}
                valueName={sambungDesaNama}
                onSelect={(id, nama) => { setSambungDesaId(id); setSambungDesaNama(nama); }}
                placeholder={sambungDaerahId ? 'Cari desa...' : 'Pilih daerah dulu'}
                table='Desa'
                parentId={sambungDaerahId}
              />
              <SearchableSelect
                fieldName='kelompokSambung'
                label='Kelompok Sambung'
                options={sambungFilteredKelompok}
                valueId={sambungKelompokId}
                valueName={sambungKelompokNama}
                onSelect={(id, nama) => { setSambungKelompokId(id); setSambungKelompokNama(nama); }}
                placeholder={sambungDesaId ? 'Cari kelompok...' : 'Pilih desa dulu'}
                table='Kelompok'
                parentId={sambungDesaId}
              />
            </div>
          </div>

          <div>
            <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2'>Dapukan Saat Ini</p>
            <div className='grid gap-3 sm:grid-cols-3'>
              <div className='space-y-1'>
                <label className='text-xs text-muted-foreground'>Dapukan Daerah</label>
                <Input name='dapukanDaerah' />
              </div>
              <div className='space-y-1'>
                <label className='text-xs text-muted-foreground'>Dapukan Desa</label>
                <Input name='dapukanDesa' />
              </div>
              <div className='space-y-1'>
                <label className='text-xs text-muted-foreground'>Dapukan Kelompok</label>
                <Input name='dapukanKelompok' />
              </div>
            </div>
          </div>

          <div>
            <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2'>Kondisi Orang Tua</p>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-1'>
                <label className='text-xs text-muted-foreground'>Kondisi Ibu</label>
                <Sel name='kondisiIbu'>
                  <option value=''>-</option>
                  <option value='Masih Hidup'>Masih Hidup</option>
                  <option value='Almarhum'>Almarhum</option>
                </Sel>
              </div>
              <div className='space-y-1'>
                <label className='text-xs text-muted-foreground'>Status Jamaah Ibu</label>
                <Sel name='statusJamaahIbu'>
                  <option value=''>-</option>
                  <option value='Sudah Jamaah'>Sudah Jamaah</option>
                  <option value='Belum Jamaah'>Belum Jamaah</option>
                </Sel>
              </div>
              <div className='space-y-1'>
                <label className='text-xs text-muted-foreground'>Kondisi Bapak</label>
                <Sel name='kondisiAyah'>
                  <option value=''>-</option>
                  <option value='Masih Hidup'>Masih Hidup</option>
                  <option value='Almarhum'>Almarhum</option>
                </Sel>
              </div>
              <div className='space-y-1'>
                <label className='text-xs text-muted-foreground'>Status Jamaah Bapak</label>
                <Sel name='statusJamaahAyah'>
                  <option value=''>-</option>
                  <option value='Sudah Jamaah'>Sudah Jamaah</option>
                  <option value='Belum Jamaah'>Belum Jamaah</option>
                </Sel>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <SubmitButton pendingText='Mendaftarkan...' className='w-full sm:w-auto'>
          <UserPlus className='mr-2 h-4 w-4' /> Daftarkan Member
        </SubmitButton>
      </div>
    </ActionForm>
    </div>
  );
}
