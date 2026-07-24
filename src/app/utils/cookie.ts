//response e jkhn patabo tkhn cookie ta set korte chai
// frontend theke je request asbe tar sathe cookie ta set kora thakbe

import { CookieOptions, Request, Response } from "express";

/*

1. 🍪 Cookie আসলে কী?
Cookie হলো আপনার ব্রাউজারের ভিতরে (কম্পিউটারের হার্ডডিস্কে) সংরক্ষিত ছোট একটি টেক্সট ফাইল (সাধারণত ৪KB)। এটি Key-Value পেয়ার আকারে ডেটা রাখে। যেমন: sessionId=abc123, theme=dark, refreshToken=xyz।


2. Set-Cookie (সার্ভার থেকে ব্রাউজারে ডেটা পাঠানো)
যখন আপনি লগইন করেন, আপনার ব্যাকএন্ড (Express সার্ভার) রেসপন্সের মাথায় (Header) Set-Cookie নামে একটি নির্দেশ পাঠায়।
HTTP/1.1 200 OK
Set-Cookie: refreshToken=eyJhbGciOiJ...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
Content-Type: application/json

এটার মানে: সার্ভার ব্রাউজারকে বলছে— "এই টোকেনটি তুমি (ব্রাউজার) তোমার কুকি স্টোরে সেভ করে রাখো। কিন্তু খেয়াল রেখো, এই কুকিটি HttpOnly (জাভাস্ক্রিপ্ট পড়তে পারবে না), Secure (শুধু HTTPS এ কাজ করবে) এবং ৭ দিন পর মেয়াদ শেষ হয়ে যাবে।"

3. Get-Cookie (ব্রাউজার থেকে সার্ভারে ডেটা পাঠানো)
যখন ইউজার আবার আপনার ওয়েবসাইটে কোনো পেজ ওপেন করে (যেমন: /api/profile), ব্রাউজার স্বয়ংক্রিয়ভাবে হার্ডডিস্ক থেকে সেই ডোমেইনের সব কুকি খুঁজে বের করে এবং অনুরোধের (Request) হেডারে Cookie নামে সার্ভারে পাঠিয়ে দেয়।
GET /api/profile HTTP/1.1
Host: salesnexus.com
Cookie: refreshToken=eyJhbGciOiJ...; theme=dark
এটার মানে: ব্রাউজার সার্ভারকে বলছে— "আমি আগে যে কুকি সেভ করেছিলাম, সেটা নাও। এখন তুমি বুঝে নাও আমি কে!"

Attribute	মানে
HttpOnly	জাভাস্ক্রিপ্ট (document.cookie) দিয়ে এই কুকি পড়া যাবে না। শুধু সার্ভার পড়তে পারে। এটি XSS (ক্রস-সাইট স্ক্রিপ্টিং) আক্রমণ প্রতিরোধ করে।
Secure	কুকিটি শুধুমাত্র HTTPS প্রোটোকলে (লক চিহ্ন) পাঠানো যাবে। HTTP সাইটে পাঠালে ব্রাউজার ব্লক করে দেয়।
SameSite=Strict	কুকিটি শুধুমাত্র আপনার ওয়েবসাইটের ভেতর থেকে পাঠানো যাবে। অন্য কোনো সাইট থেকে (CSRF Attack) পাঠালে ব্রাউজার তা আটকে দেয়।

Set-Cookie: better-auth.session-token=abc...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
Cookie শুধু টোকেন সেভ করে না, এটি সেভ করা টোকেনকে স্বয়ংক্রিয়ভাবে এবং নিরাপদে (HttpOnly + Secure) সার্ভারে পৌঁছে দেওয়ার দায়িত্বও পালন করে
*/
const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

const getCookie = (req: Request, key: string) => {
  return req.cookies[key];
};
const clearCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

export const cookieUtils = {
  setCookie,
  getCookie,
  clearCookie,
};
