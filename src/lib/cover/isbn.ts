import { westernize } from './numbers';

export function normalizeIsbn(input: string): string {
  return westernize(input).replace(/[\s-]/g, '');
}
export function isValidIsbn13(input: string): boolean {
  const isbn = normalizeIsbn(input);
  if (!/^97[89]\d{10}$/.test(isbn)) return false;
  const sum = [...isbn].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
  return sum % 10 === 0;
}

const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
const R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
const parity = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
export function isbn13Bits(input: string): string {
  const isbn = normalizeIsbn(input);
  if (!isValidIsbn13(isbn)) throw new Error('Invalid ISBN-13');
  const first = Number(isbn[0]);
  let bits = '101';
  for (let i = 1; i <= 6; i++) {
    const digit = Number(isbn[i]);
    bits += parity[first][i - 1] === 'L' ? L[digit] : G[digit];
  }
  bits += '01010';
  for (let i = 7; i < 13; i++) bits += R[Number(isbn[i])];
  return bits + '101';
}
