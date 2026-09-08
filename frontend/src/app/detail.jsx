'use client';
import {use, useEffect,useState} from 'react';
import {api} from '../lib/api';

export default function Detail({type,params}){
  const {id}=use(params);
  const [d,setD]=useState();
  const [rating,setRating]=useState('');
  const [review,setReview]=useState('');
  async function load(){
    try {
      const data = await api(`/content/${id}`);
      setD(data);
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(()=>{load()},[id]);
  if(!d)return <div className="shell py-20 muted">Loading…</div>;
  const c=d.content;
  async function action(path,body={}){
    await api(`/content/${id}/${path}`,{method:'POST',body:JSON.stringify(body)});
    load();
  }
  return (
    <div className="shell py-12">
      <div className="grid md:grid-cols-[280px_1fr] gap-10">
        <div className="card aspect-[2/3] bg-neutral-200 dark:bg-neutral-800"/>
        <div>
          <div className="text-xs uppercase tracking-[.2em] muted font-bold">{type} · {c.year}</div>
          <h1 className="text-5xl font-black mt-2">{c.title}</h1>
          <p className="muted mt-2">★ {Number(c.averageRating||0).toFixed(1)} · {c.ratingCount||0} ratings</p>
          <p className="text-lg leading-8 mt-7 max-w-3xl">{c.description}</p>
          <div className="flex flex-wrap gap-2 mt-7">{(c.genres||[]).map((g)=><span className="btn" key={g}>{g}</span>)}</div>
          <div className="flex flex-wrap gap-2 mt-8">
            <button className="btn btn-primary" onClick={()=>action('status',{status:type==='MOVIE'?'WATCHED':'READ'})}>{type==='MOVIE'?'Mark watched':'Mark read'}</button>
            <button className="btn" onClick={()=>action('status',{status:type==='MOVIE'?'WATCHLIST':'WANT_TO_READ'})}>{type==='MOVIE'?'Watchlist':'Want to read'}</button>
            <button className="btn" onClick={()=>action('like')}>♥ Like</button>
            <button className="btn" onClick={()=>action('favorite')}>★ Favorite</button>
          </div>
          <div className="card p-5 mt-10 max-w-xl">
            <h2 className="font-bold">Your rating</h2>
            <div className="flex gap-2 mt-3">
              <input className="input" type="number" min="0.5" max="5" step="0.5" value={rating} onChange={e=>setRating(e.target.value)} placeholder="0.5–5"/>
              <button className="btn btn-primary" onClick={()=>action('rating',{score:Number(rating)})}>Save</button>
            </div>
          </div>
          <div className="card p-5 mt-5 max-w-2xl">
            <h2 className="font-bold">Write a review</h2>
            <textarea className="input mt-3 min-h-32" value={review} onChange={e=>setReview(e.target.value)} placeholder="What did you think?"/>
            <button className="btn btn-primary mt-3" onClick={()=>{action('reviews',{body:review,spoiler:false});setReview('')}}>Publish review</button>
          </div>
        </div>
      </div>
      <section className="mt-14">
        <h2 className="text-2xl font-black">Community reviews</h2>
        <div className="space-y-4 mt-5">
          {d.reviews?.map((r)=>(
            <article className="card p-5" key={r._id}>
              <div className="font-bold">{r.userId?.displayName||r.userId?.username||'Member'}</div>
              <p className="mt-3 leading-7">{r.spoiler?'Spoiler review':r.body}</p>
              <div className="text-xs muted mt-3">♥ {r.likeCount||0} · {r.commentCount||0} comments</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
