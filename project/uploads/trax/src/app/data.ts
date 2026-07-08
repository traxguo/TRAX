const AVATAR_COLORS = ['#c8ff1e','#4be38a','#66a3ff','#ffb84d','#ff6358','#b388ff','#2de2c0','#ff8fab'];

export function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
