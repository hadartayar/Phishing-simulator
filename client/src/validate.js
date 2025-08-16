export function required(v, name='Field') {
  if (!v || (typeof v==='string' && v.trim()==='')) return `${name} is required`;
}
export function isEmail(v, name='Email') {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||'')) return `${name} is not a valid email`;
}
export function combine(...validators) {
  return (v) => {
    for (const fn of validators) {
      const msg = fn(v);
      if (msg) return msg;
    }
  }
}
