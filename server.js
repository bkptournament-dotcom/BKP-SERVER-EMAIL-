const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();

app.use(express.json());

// --- OFFICIAL BRAND CONFIG ---
const BRAND_NAME = "BKP ESPORTS";
const ADMIN_EMAIL = "bkptournament@gmail.com"; // Corrected Email
const APP_PASSWORD = "jckydognphkbzigs";      // App Password for this email
const TELEGRAM_TOKEN = "8626633336:AAEB7N4XswyXTKmLV5C44EFriU8u3o9kl-A";
const CHAT_ID = "6162679627";

// --- PROFESSIONAL EMAIL TEMPLATE ---
const getEmailTemplate = (title, content) => `
<div style="font-family: 'Segoe UI', sans-serif; background-color: #050505; padding: 20px; color: #ffffff;">
    <div style="max-width: 600px; margin: auto; background: #111111; border: 1px solid #e91e63; border-radius: 15px; overflow: hidden; box-shadow: 0 0 20px rgba(233, 30, 99, 0.5);">
        <div style="background: linear-gradient(90deg, #e91e63, #880e4f); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: 3px; color: white;">${BRAND_NAME}</h1>
            <p style="margin: 5px 0 0; font-size: 11px; text-transform: uppercase; color: #ffc107; font-weight: bold;">Official Arena Communication</p>
        </div>
        <div style="padding: 30px; line-height: 1.6;">
            <h2 style="color: #e91e63; border-bottom: 1px solid #333; padding-bottom: 10px; font-size: 20px;">${title}</h2>
            <div style="font-size: 15px; color: #ddd;">
                ${content}
            </div>
            <p style="margin-top: 30px; font-size: 13px; color: #666; border-top: 1px solid #222; padding-top: 15px;">
                Important: If you didn't request this action, please secure your account immediately.
            </p>
        </div>
        <div style="background: #000; padding: 15px; text-align: center; font-size: 10px; color: #444;">
            &copy; 2024 ${BRAND_NAME} Global. All Rights Reserved.<br>
            Anti-Cheat Verified | Professional Esports Hub
        </div>
    </div>
</div>`;

// --- UI (PROFESSIONAL WEB PANEL) ---
const ui = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${BRAND_NAME} | Official Portal</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;500;700&display=swap');
        body { background: #050505; color: #fff; font-family: 'Poppins', sans-serif; display: flex; justify-content: center; padding: 20px; margin: 0; min-height: 100vh; align-items: center; }
        .card { background: #111; width: 100%; max-width: 400px; border-radius: 25px; border: 1.5px solid #e91e63; box-shadow: 0 0 50px rgba(233, 30, 99, 0.2); overflow: hidden; }
        .header { background: linear-gradient(135deg, #e91e63, #311b92); padding: 30px; text-align: center; }
        .header h2 { margin: 0; font-family: 'Orbitron'; letter-spacing: 4px; font-size: 22px; }
        .tabs { display: flex; background: #000; }
        .tab { flex: 1; padding: 15px; text-align: center; cursor: pointer; font-size: 11px; color: #555; transition: 0.3s; font-family: 'Orbitron'; }
        .tab.active { color: #fff; background: #111; border-bottom: 4px solid #e91e63; font-weight: bold; }
        .form { padding: 30px; }
        input { width: 100%; padding: 14px; margin-bottom: 18px; background: #000; border: 1px solid #333; color: #fff; border-radius: 12px; box-sizing: border-box; font-size: 14px; }
        input:focus { border-color: #e91e63; outline: none; }
        button { width: 100%; padding: 16px; background: #e91e63; color: #fff; border: none; border-radius: 12px; font-weight: bold; font-family: 'Orbitron'; letter-spacing: 2px; cursor: pointer; box-shadow: 0 5px 15px rgba(233, 30, 99, 0.3); }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h2>${BRAND_NAME}</h2>
            <p style="font-size:10px; margin:5px 0 0; opacity:0.8; letter-spacing: 2px;">SECURE ARENA ACCESS</p>
        </div>
        <div class="tabs">
            <div class="tab active" onclick="switchTab(this, 'otp')">OTP</div>
            <div class="tab" onclick="switchTab(this, 'deposit')">DEPOSIT</div>
            <div class="tab" onclick="switchTab(this, 'room')">MATCH</div>
        </div>
        <div class="form">
            <input type="text" id="name" placeholder="GAMER NAME">
            <input type="email" id="email" placeholder="GMAIL ADDRESS">

            <div id="otp-sec"></div>
            <div id="deposit-sec" class="hidden">
                <input type="number" id="amount" placeholder="AMOUNT (INR)">
                <input type="text" id="utr" placeholder="TRANSACTION UTR">
            </div>
            <div id="room-sec" class="hidden">
                <input type="text" id="room_name" placeholder="ROOM TITLE">
                <input type="text" id="room_id" placeholder="ROOM ID">
                <input type="text" id="room_pass" placeholder="PASSWORD">
            </div>

            <button onclick="submitRequest()" id="btn">SEND DATA</button>
        </div>
    </div>

    <script>
        let mode = 'otp';
        function switchTab(el, type) {
            mode = type;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            document.getElementById('otp-sec').classList.add('hidden');
            document.getElementById('deposit-sec').classList.add('hidden');
            document.getElementById('room-sec').classList.add('hidden');
            document.getElementById(type + '-sec').classList.remove('hidden');
        }

        async function submitRequest() {
            const btn = document.getElementById('btn');
            const body = {
                mode, name: document.getElementById('name').value, email: document.getElementById('email').value,
                amount: document.getElementById('amount').value, utr: document.getElementById('utr').value,
                room_name: document.getElementById('room_name').value, room_id: document.getElementById('room_id').value,
                room_pass: document.getElementById('room_pass').value
            };
            if(!body.email || !body.name) return alert("Bhai, Name aur Email zaroori hai!");
            
            btn.innerText = "SENDING...";
            btn.disabled = true;

            try {
                const res = await fetch('/api/request', { 
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify(body)
                });
                const r = await res.json();
                alert(r.message);
            } catch(e) { 
                alert("Success! Check Gmail/Telegram"); 
            } finally {
                btn.innerText = "SEND DATA";
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>`;

// --- BACKEND API ---
app.get('/', (req, res) => res.send(ui));

app.post('/api/request', async (req, res) => {
    const d = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);

    let emailTitle = "";
    let emailContent = "";
    let teleMsg = "";

    if (d.mode === 'otp') {
        emailTitle = "Verification Code";
        emailContent = `<p>Hi <b>${d.name}</b>,</p><p>A request was made to verify your account. Use the following OTP to continue:</p><div style="background:#000; padding:20px; text-align:center; border:1px dashed #e91e63; border-radius:10px;"><h1 style="color:#e91e63; font-size:45px; margin:0; letter-spacing:8px;">${otp}</h1></div>`;
        teleMsg = `🔐 *VERIFICATION REQUEST*\n\n👤 User: ${d.name}\n📧 Email: ${d.email}\n🔢 OTP: \`${otp}\``;
    } 
    else if (d.mode === 'deposit') {
        emailTitle = "Deposit Request Logged";
        emailContent = `<p>Hello <b>${d.name}</b>,</p><p>Your deposit request has been successfully submitted to our financial node. Details:</p><div style="background:#000; padding:15px; border-radius:10px; font-family:monospace;"><b>AMOUNT:</b> ₹${d.amount}<br><b>UTR ID:</b> ${d.utr}</div><p>Status: <span style="color:#ffc107;">PENDING VERIFICATION</span></p>`;
        teleMsg = `💰 *NEW DEPOSIT SUBMITTED*\n\n👤 User: ${d.name}\n💵 Amount: ₹${d.amount}\n🔢 UTR: \`${d.utr}\` \n📧 Email: ${d.email}`;
    }
    else if (d.mode === 'room') {
        emailTitle = "Battle Deployment Details";
        emailContent = `<p>Greetings <b>${d.name}</b>, your match deployment is ready.</p><div style="background:#000; padding:20px; border-left:5px solid #e91e63; border-radius:10px;"><b>ROOM NAME:</b> ${d.room_name}<br><b>ROOM ID:</b> <span style="color:#e91e63;">${d.room_id}</span><br><b>PASSWORD:</b> <span style="color:#e91e63;">${d.room_pass}</span></div>`;
        teleMsg = `🏆 *ROOM CREDENTIALS*\n\n🎮 Match: ${d.room_name}\n🆔 ID: \`${d.room_id}\` \n🔑 Pass: \`${d.room_pass}\` \n👤 User: ${d.name}`;
    }

    try {
        let transporter = nodemailer.createTransport({ 
            service: 'gmail', 
            auth: { user: ADMIN_EMAIL, pass: APP_PASSWORD } 
        });
        
        // 1. Send Company Level HTML Email
        await transporter.sendMail({
            from: `"${BRAND_NAME} Official" <${ADMIN_EMAIL}>`,
            to: d.email,
            subject: `[${BRAND_NAME}] ${emailTitle}`,
            html: getEmailTemplate(emailTitle, emailContent)
        });

        // 2. Notify Admin on Telegram
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID, 
            text: teleMsg, 
            parse_mode: 'Markdown'
        });

        res.json({ message: "Official Transmission Successful!" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(process.env.PORT || 3000, () => console.log("BKP Official Server Live!"));