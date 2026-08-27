// 1. Animation Scroll Reveal
const els = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });
els.forEach(el => io.observe(el));

// 2. Logic Ghép ảnh Canvas & Gửi Dữ liệu
const API_URL = "https://script.google.com/mc";
MR8ZaHuWLBrpDd3NESLt7n9t-eMbwEVUAQNY396ge
let imageFile = null;

document.getElementById('guestImage').addEventListener('change', function(e) {
    if (e.target.files[0]) {
        imageFile = e.target.files[0];
        document.getElementById('fileName').textContent = imageFile.name;
    }
});

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else { line = testLine; }
    }
    context.fillText(line, x, y);
    return y + lineHeight;
}

document.getElementById('wishForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await document.fonts.ready;

    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('statusMessage');
    btn.innerText = "ĐANG XỬ LÝ...";
    btn.disabled = true;

    // Lấy toàn bộ dữ liệu form mới
    const name = document.getElementById('guestName').value;
    const wish = document.getElementById('guestWish').value;
    const attendance = document.getElementById('attendance').value;
    const plusOne = document.getElementById('plusOne').value;
    const guestOf = document.getElementById('guestOf').value;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1080;

    // Background Kem
    ctx.fillStyle = "#F8F5F4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Viền Đỏ mận
    ctx.strokeStyle = "#7A1C29";
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, 1000, 1000);

    // Header
    ctx.fillStyle = "#7A1C29";
    ctx.font = "bold 60px 'Playfair Display', serif";
    ctx.textAlign = "center";
    ctx.fillText("Wedding Wishes", canvas.width / 2, 130);
    ctx.font = "40px 'Cormorant Garamond', serif";
    ctx.fillText("Bảo Kiện & Quỳnh Anh", canvas.width / 2, 190);

    const sendToDrive = () => {
        const base64Data = canvas.toDataURL("image/jpeg", 0.85).split(',')[1];

        // GÓI GỌN DỮ LIỆU ĐỂ GỬI LÊN APPS SCRIPT
        const payload = {
            name: name,
            wish: wish,
            attendance: attendance,
            plusOne: plusOne,
            guestOf: guestOf,
            filename: name.replace(/\s+/g, '_') + '_wish.jpg',
            image: base64Data,
            mimeType: "image/jpeg"
        };

        fetch(API_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            })
            .then(res => res.text())
            .then(res => {
                status.style.color = "#7A1C29";
                status.innerText = "Xác nhận thành công! Cảm ơn bạn rất nhiều.";
                document.getElementById('wishForm').reset();
                document.getElementById('fileName').textContent = "";
                imageFile = null;
                btn.innerText = "XÁC NHẬN";
                btn.disabled = false;
            })
            .catch(err => {
                status.style.color = "red";
                status.innerText = "Chưa kết nối API Google Drive, vui lòng cấu hình link API trong script.js.";
                btn.innerText = "XÁC NHẬN";
                btn.disabled = false;
            });
    };

    if (imageFile) {
        const img = new Image();
        img.onload = () => {
            const targetW = 800;
            const targetH = 450;
            let drawW = img.width;
            let drawH = img.height;
            const ratio = Math.max(targetW / drawW, targetH / drawH);
            drawW *= ratio;
            drawH *= ratio;
            const sx = (drawW - targetW) / 2 / ratio;
            const sy = (drawH - targetH) / 2 / ratio;

            ctx.drawImage(img, sx, sy, img.width - sx * 2, img.height - sy * 2, 140, 250, targetW, targetH);
            ctx.strokeStyle = "#7A1C29";
            ctx.lineWidth = 6;
            ctx.strokeRect(140, 250, targetW, targetH);

            ctx.font = "italic 42px 'Cormorant Garamond', serif";
            ctx.fillStyle = "#3A2A2B";
            let textY = wrapText(ctx, '"' + wish + '"', canvas.width / 2, 780, 860, 55);

            ctx.font = "bold 70px 'Great Vibes', cursive";
            ctx.fillStyle = "#7A1C29";
            ctx.textAlign = "right";
            ctx.fillText("- " + name, 920, textY + 60);

            sendToDrive();
        };
        img.src = URL.createObjectURL(imageFile);
    } else {
        ctx.font = "italic 52px 'Cormorant Garamond', serif";
        ctx.fillStyle = "#3A2A2B";
        ctx.textAlign = "center";
        let textY = wrapText(ctx, '"' + wish + '"', canvas.width / 2, 480, 860, 70);

        ctx.font = "bold 90px 'Great Vibes', cursive";
        ctx.fillStyle = "#7A1C29";
        ctx.textAlign = "right";
        ctx.fillText("- " + name, 900, textY + 120);

        sendToDrive();
    }
});
