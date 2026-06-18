'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function GenderFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const jenisKelamin = params.get('jenisKelamin') || '';
  const q = params.get('q') || '';

  const handleChange = (val: string) => {
    const query = new URLSearchParams();
    if (q) query.set('q', q);
    if (val) query.set('jenisKelamin', val);
    router.push(`?${query.toString()}`);
  };

  return (
    <select
      value={jenisKelamin}
      onChange={(e) => handleChange(e.target.value)}
      className='h-9 rounded-md border border-input bg-background px-3 py-1 text-sm'
    >
      <option value=''>Semua Gender</option>
      <option value='IKHWAN'>Laki-Laki</option>
      <option value='AKHWAT'>Perempuan</option>
    </select>
  );
}
