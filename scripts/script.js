const userID = "870287310984462408";
const elements = {
	statusBox: document.querySelector(".status"),
	statusImage: document.getElementById("status-image"),
	displayName: document.querySelector(".display-name"),
	username: document.querySelector(".username"),
	avatarImage: document.getElementById("avatar-image"),
	bannerImage: document.getElementById("banner-image"),
	avatarDecoration: document.querySelector(".avatar-decoration"),
	profileBorder: document.querySelector(".profile-border"), // Đã sửa lỗi ở đây
	profile: document.querySelector(".profile"),
	customStatus: document.querySelector(".custom-status"),
	customStatusText: document.querySelector(".custom-status-text"),
	customStatusEmoji: document.getElementById("custom-status-emoji"),
    toggleExtraContentButton: document.getElementById("toggleExtraContentButton"),
    extraContentContainer: document.getElementById("extraContentContainer"),
};
function startWebSocket() {
	const ws = new WebSocket("wss://api.lanyard.rest/socket");
	ws.onopen = () => {
		ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userID } }));
	};
	ws.onmessage = (event) => {
		const { t, d } = JSON.parse(event.data);
		if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
			updateStatus(d);
		}
	};
	ws.onerror = (error) => {
		console.error("Lỗi WebSocket:", error);
		ws.close();
	};
	ws.onclose = () => {
		console.log("WebSocket đóng, thử kết nối lại...");
		setTimeout(startWebSocket, 1000);
	};
}
function updateStatus(lanyardData) {
	const { discord_status, activities, discord_user } = lanyardData;
	elements.displayName.innerHTML = discord_user.display_name;
	elements.username.innerHTML = discord_user.username;

	// Update avatar dynamically from Discord
	if (discord_user.avatar) {
		const avatarUrl = `https://cdn.discordapp.com/avatars/${userID}/${discord_user.avatar}?size=128`;
		elements.avatarImage.src = avatarUrl;
	}

	// Set static banner image
	elements.bannerImage.src = "https://i.pinimg.com/originals/e5/09/68/e50968e3461aa65eab4432a1ead39d12.gif";

	// Update avatar decoration from Discord
    if (discord_user.avatar_decoration) {
        const decorationUrl = `https://cdn.discordapp.com/avatar-decorations/${userID}/${discord_user.avatar_decoration}.png`;
        elements.avatarDecoration.src = decorationUrl;
        elements.avatarDecoration.style.display = "block";
    } else {
        elements.avatarDecoration.src = "./public/discord_fake_avatar_decorations_1753632299856-ezgif.com-gif-to-webp-converter.webp";
        elements.avatarDecoration.style.display = "block";
    }

	let imagePath;
	let label;
	switch (discord_status) {
		case "online":
			imagePath = "./public/status/online.svg";
			label = "Online";
			break;
		case "idle":
			imagePath = "./public/status/idle.svg";
			label = "Idle / AFK";
			break;
		case "dnd":
			imagePath = "./public/status/dnd.svg";
			label = "Do Not Disturb";
			break;
		case "offline":
			imagePath = "./public/status/offline.svg";
			label = "Offline";
			break;
		default:
			imagePath = "./public/status/offline.svg";
			label = "Unknown";
			break;
	}
	const isStreaming = activities.some(
		(activity) =>
			activity.type === 1 &&
			(activity.url.includes("twitch.tv") ||
				activity.url.includes("youtube.com"))
	);
	if (isStreaming) {
		imagePath = "./public/status/streaming.svg";
		label = "Streaming";
	}
	elements.statusImage.src = imagePath;
	elements.statusBox.setAttribute("aria-label", label);
	if (activities[0]?.state) {
		elements.customStatusText.innerHTML = activities[0].state;
	} else {
		elements.customStatusText.innerHTML = "Not doing anything!";
	}
	const emoji = activities[0]?.emoji;
	if (emoji?.id) {
		elements.customStatusEmoji.src = `https://cdn.discordapp.com/emojis/${emoji.id}?format=webp&size=24&quality=lossless`;
	} else if (emoji?.name) {
		elements.customStatusEmoji.src = "./public/icons/poppy.png";
	} else {
		elements.customStatusEmoji.style.display = "none";
	}
	if (!activities[0]?.state && !emoji) {
		elements.customStatus.style.display = "none";
	} else {
		elements.customStatus.style.display = "flex";
	}
}

// Thêm sự kiện click cho nút để hiển thị/ẩn nội dung phụ
elements.toggleExtraContentButton.addEventListener("click", () => {
    const extraCards = elements.extraContentContainer.querySelectorAll(".extra-card");

    if (elements.extraContentContainer.classList.contains("active")) {
        // Nếu đang active, ẩn đi và đặt lại vị trí về giữa
        elements.extraContentContainer.classList.remove("active");
        extraCards.forEach(card => {
            // Đặt lại vị trí ban đầu (ẩn ở giữa)
            card.style.transform = `translate(-50%, -50%)`;
            card.style.opacity = '0';
            card.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        });
    } else {
        // Nếu không active, hiển thị và bung ra
        elements.extraContentContainer.classList.add("active");
        extraCards.forEach((card, index) => {
            // Đặt lại transition trước khi áp dụng transform để kích hoạt animation
            card.style.transition = 'transform 0.7s ease-out, opacity 0.7s ease-out';
            card.style.opacity = '1';

            if (window.innerWidth <= 900) { // Mobile breakpoint
                if (index % 2 === 0) { // Card 1, 3, 5... (bên trái)
                    card.style.transform = `translateX(calc(-50vw + 150px + 90px + 20px)) translateY(-50%)`; // Bung sang trái xa hơn
                } else { // Card 2, 4, 6... (bên phải)
                    card.style.transform = `translateX(calc(50vw - 150px - 90px - 20px)) translateY(-50%)`; // Bung sang phải xa hơn
                }
            } else { // Desktop
                if (index % 2 === 0) { // Card 1, 3, 5... (bên trái)
                    card.style.transform = `translateX(calc(-50vw + 300px + 175px + 50px)) translateY(-50%)`; // Bung sang trái xa hơn
                } else { // Card 2, 4, 6... (bên phải)
                    card.style.transform = `translateX(calc(50vw - 300px - 175px - 50px)) translateY(-50%)`; // Bung sang phải xa hơn
                }
            }
            // Điều chỉnh vị trí dọc ban đầu cho từng card để không bị chồng lên nhau
            if (index === 0) card.style.marginTop = '-100px'; // Điều chỉnh vị trí dọc cho card 1
            else if (index === 1) card.style.marginTop = '-100px'; // Điều chỉnh vị trí dọc cho card 2
            // Thêm các điều kiện cho card 3, 4 nếu có
            // else if (index === 2) card.style.marginTop = '100px'; // Ví dụ cho card 3 ở dưới
            // else if (index === 3) card.style.marginTop = '100px'; // Ví dụ cho card 4 ở dưới
        });
    }
});


startWebSocket();
