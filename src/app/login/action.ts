'use server';

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://desa-wisata-bojongrangkas.biznityhub.com/wp-json';
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY || 'ck_3512f4b660cb493791156b8e2a57ed734fe92fe4';
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || 'cs_6e530c56ba5fdd875c311c8b24b2429fe5885db3';

// 1. ACTION FOR SIGN IN (ADMIN + USER JWT PASSWORD VERIFICATION)
export async function loginAction(formData: FormData) {
  const usernameOrEmail = (formData.get('username') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();

  if (!usernameOrEmail || !password) {
    return { success: false, message: 'Username/Email dan password wajib diisi!' };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    // A. CEK APAKAH INI AKUN ADMIN SPESIFIK
    const isAdminAccount = 
      (usernameOrEmail === 'faqihhasan217@gmail.com' || 
       usernameOrEmail === 'desawisatabojongrangkas' ||
       usernameOrEmail === 'faqihhasan') && 
      password === 'bojongrangkas2026';

    if (isAdminAccount) {
      return {
        success: true,
        token: 'admin-session-token-' + Date.now(),
        email: 'faqihhasan217@gmail.com',
        name: 'Administrator',
        role: 'admin',
        redirectTo: '/admin',
      };
    }

    // B. VALIDASI PASSWORD KETAT KE WORDPRESS VIA JWT
    const jwtRes = await fetch(`${WP_URL}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameOrEmail,
        password: password,
      }),
      cache: 'no-store',
    });

    const jwtData = await jwtRes.json();

    if (!jwtRes.ok || !jwtData.token) {
      return { 
        success: false, 
        message: 'Password salah, atau kombinasi Username/Email tidak cocok!' 
      };
    }

    // C. AMBIL DETAIL DATA CUSTOMER DARI WOOCOMMERCE
    const searchRes = await fetch(`${WP_URL}/wc/v3/customers?email=${encodeURIComponent(jwtData.user_email || usernameOrEmail)}`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    const searchData = await searchRes.json();

    let foundUser = (Array.isArray(searchData) && searchData.length > 0) ? searchData[0] : null;

    if (!foundUser) {
      const userRes = await fetch(`${WP_URL}/wc/v3/customers?per_page=100`, {
        headers: { Authorization: authHeader },
        cache: 'no-store',
      });
      const allUsers = await userRes.json();
      if (Array.isArray(allUsers)) {
        foundUser = allUsers.find((u: any) => 
          u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
          u.email.toLowerCase() === usernameOrEmail.toLowerCase()
        );
      }
    }

    return {
      success: true,
      token: jwtData.token,
      email: jwtData.user_email || foundUser?.email || usernameOrEmail,
      name: jwtData.user_nicename || foundUser?.first_name || foundUser?.username || 'Pengunjung',
      role: 'subscriber',
      redirectTo: '/user/dashboard',
    };

  } catch (error) {
    console.error("Login Action Error:", error);
    return { success: false, message: 'Terjadi kesalahan koneksi ke server WordPress.' };
  }
}

// 2. ACTION FOR SIGN UP (REGISTRASI USER BARU)
export async function registerAction(formData: FormData) {
  const username = (formData.get('username') as string || '').trim();
  const email = (formData.get('email') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();

  if (!username || !email || !password) {
    return { success: false, message: 'Semua kolom pendaftaran wajib diisi!' };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const checkRes = await fetch(`${WP_URL}/wc/v3/customers?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    const checkData = await checkRes.json();

    if (Array.isArray(checkData) && checkData.length > 0) {
      return { success: false, message: 'Email tersebut sudah terdaftar! Silakan langsung Sign In.' };
    }

    const res = await fetch(`${WP_URL}/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        role: 'customer'
      }),
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      return { 
        success: false, 
        message: data.message || 'Gagal mendaftar. Username atau Email sudah digunakan.' 
      };
    }

    return { success: true, message: 'Registrasi berhasil! Silakan Sign In dengan akun baru Anda.' };
  } catch (error) {
    console.error("Register Action Error:", error);
    return { success: false, message: 'Terjadi kesalahan server saat mendaftarkan akun.' };
  }
}

// 3. ACTION FOR FORGOT PASSWORD (LUPA PASSWORD)
export async function forgotPasswordAction(formData: FormData) {
  const email = (formData.get('email') as string || '').trim();

  if (!email) {
    return { success: false, message: 'Silakan masukkan email akun kamu terlebih dahulu!' };
  }

  try {
    // Menggunakan endpoint bawaan WordPress untuk memicu reset password via email
    const res = await fetch(`${WP_URL}/wp/v2/users/lost-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_login: email }),
      cache: 'no-store',
    });

    return { 
      success: true, 
      message: 'Jika email terdaftar, instruksi pemulihan password telah dikirim. Silakan cek inbox atau folder spam email kamu.' 
    };

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return { success: false, message: 'Terjadi kesalahan saat memproses permintaan reset password.' };
  }
}