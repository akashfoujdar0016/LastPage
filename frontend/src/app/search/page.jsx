'use client';
import {useState} from 'react';
import ContentCard from '../../components/ContentCard';
import {api} from '../../lib/api';

export default function Search(){
  const [q,setQ]=useState('');
  const [type,setType]=useState('');
  const [items,setItems]=useState([]);
  async function go(){
    try {
      const d=await api(`/content?q=${encodeURIComponent(q)}${type?`&type=${type}`:''}&limit=50`);
      setItems(d.items||[]);
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <div className="shell py-12">
      <h1 className="text-5xl font-black">Search</h1>
      <div className="flex gap-2 max-w-2xl mt-7">
        <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Title, author, director, ISBN..."/>
        <select className="input max-w-32" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">All</option>
          <option value="MOVIE">Movies</option>
          <option value="BOOK">Books</option>
        </select>
        <button className="btn btn-primary" onClick={go}>Search</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5 mt-10">
        {items.map(x=><ContentCard key={x._id} item={x}/>)}
      </div>
    </div>
  );
}
