const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

const CREDENTIALS = {
    username: "demosinetech",
    password: "demosinetech",
    server_name: "Sinetech Pro IPTV Demo"
};

// 403 Hatası Vermeyen %100 Çalışan Arşiv Linkleri (Archive.org)
const liveStreamsPool = [
    { name: "🔥 Şömine Keyfi (Fireplace HD)", icon: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", url: "https://archive.org/download/fireplace_202012/Fireplace.mp4" },
    { name: "🌲 Orman & Doğa Huzuru (Nature)", icon: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500", url: "https://archive.org/download/WildlifeSampleVideo/Wildlife.mp4" },
    { name: "🌊 Okyanus Dalgaları (Relaxing)", icon: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500", url: "https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4" },
    { name: "🌧️ Yağmur ve Kulübe Sesi", icon: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=500", url: "https://archive.org/download/WildlifeSampleVideo/Wildlife.mp4" },
    { name: "🏔️ Alp Dağları Manzarası", icon: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500", url: "https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4" }
];

const movieVideosPool = [
    { title: "Big Buck Bunny (4K Animasyon)", url: "https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4", poster: "https://peach.blender.org/wp-content/uploads/title-anims-01.jpg" },
    { title: "Sintel (Destansı Macera)", url: "https://archive.org/download/Sintel_2010/sintel-1080-surround_512kb.mp4", poster: "https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg" },
    { title: "Tears of Steel (Bilim Kurgu)", url: "https://archive.org/download/TearsOfSteel/tears_of_steel_1080p.mov", poster: "https://mango.blender.org/wp-content/uploads/2012/12/tos_poster.jpg" },
    { title: "Wildlife Doğa Belgeseli", url: "https://archive.org/download/WildlifeSampleVideo/Wildlife.mp4", poster: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500" },
    { title: "Şömine Özel Akış", url: "https://archive.org/download/fireplace_202012/Fireplace.mp4", poster: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" }
];

// 5 Kategori x 5 Kanal = 25 Canlı Kanal
const allLiveStreams = [];
let streamIdCounter = 100;
for (let cat = 1; cat <= 5; cat++) {
    for (let i = 1; i <= 5; i++) {
        streamIdCounter++;
        const template = liveStreamsPool[(i - 1) % liveStreamsPool.length];
        allLiveStreams.push({
            num: allLiveStreams.length + 1,
            name: `Canlı TV ${cat} - Kanal ${i} (${template.name})`,
            stream_type: "live",
            stream_id: streamIdCounter,
            stream_icon: template.icon,
            epg_channel_id: `ch_${cat}_${i}`,
            added: "1680000000",
            category_id: `${cat}`,
            direct_source: template.url
        });
    }
}

// 30 Adet VOD Film
const allMovies = [];
for (let i = 1; i <= 30; i++) {
    const template = movieVideosPool[(i - 1) % movieVideosPool.length];
    allMovies.push({
        stream_id: 3000 + i,
        name: `Demo Film #${i}: ${template.title}`,
        title: `Demo Film #${i}: ${template.title}`,
        stream_type: "movie",
        stream_icon: template.poster,
        rating: "9.1",
        rating_count_tot: 1200,
        year: 2023,
        genre: "Relaxing, Nature, Animation",
        category_id: "10",
        video_url: template.url
    });
}

// Player API
app.get('/player_api.php', (req, res) => {
    const { username, password, action } = req.query;

    if (username !== CREDENTIALS.username || password !== CREDENTIALS.password) {
        return res.json({ user_info: { auth: 0 }, status: "Unauthorized" });
    }

    if (!action) {
        const hostUrl = req.protocol + '://' + req.get('host');
        return res.json({
            user_info: { username, password, auth: 1, status: "Active", exp_date: "1970534400" },
            server_info: { url: hostUrl, port: "80", https_port: "443", server_protocol: "https" }
        });
    }

    if (action === 'get_live_categories') {
        return res.json([
            { category_id: "1", category_name: "Canlı TV 1 (Şömine & Doğa)", parent_id: 0 },
            { category_id: "2", category_name: "Canlı TV 2 (Okyanus & Dalga)", parent_id: 0 },
            { category_id: "3", category_name: "Canlı TV 3 (Yağmur & Huzur)", parent_id: 0 },
            { category_id: "4", category_name: "Canlı TV 4 (Manzara)", parent_id: 0 },
            { category_id: "5", category_name: "Canlı TV 5 (Özel Akış)", parent_id: 0 }
        ]);
    }

    if (action === 'get_live_streams') {
        const catId = req.query.category_id;
        if (catId) {
            return res.json(allLiveStreams.filter(s => s.category_id === catId));
        }
        return res.json(allLiveStreams);
    }

    if (action === 'get_vod_categories') {
        return res.json([
            { category_id: "10", category_name: "🍿 Telifsiz 4K & Doğa Filmleri (VOD)", parent_id: 0 }
        ]);
    }

    if (action === 'get_vod_streams') {
        return res.json(allMovies);
    }

    if (action === 'get_vod_info') {
        const vodId = parseInt(req.query.vod_id);
        const movie = allMovies.find(m => m.stream_id === vodId) || allMovies[0];
        return res.json({
            info: {
                name: movie.name,
                movie_image: movie.stream_icon,
                description: "Yüksek kaliteli telifsiz demo video içeriğidir.",
                genre: movie.genre,
                releasedate: `${movie.year}-01-01`,
                rating: movie.rating
            },
            movie_data: { stream_id: movie.stream_id, container_extension: "mp4" }
        });
    }

    res.json({ error: "Unknown action" });
});

// Yönlendirmeler
app.get('/:username/:password/:streamParam', (req, res, next) => {
    const { username } = req.params;
    if (username === 'player_api.php' || username === 'live' || username === 'movie' || username === 'series') {
        return next();
    }
    const rawId = req.params.streamParam.split('.')[0];
    const stream = allLiveStreams.find(s => s.stream_id.toString() === rawId);
    if (stream) {
        return res.redirect(301, stream.direct_source);
    }
    return res.redirect(301, 'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4');
});

app.get('/live/:username/:password/:streamParam', (req, res) => {
    const rawId = req.params.streamParam.split('.')[0];
    const stream = allLiveStreams.find(s => s.stream_id.toString() === rawId);
    if (stream) {
        return res.redirect(301, stream.direct_source);
    }
    return res.redirect(301, 'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4');
});

app.get('/movie/:username/:password/:movieParam', (req, res) => {
    const rawId = req.params.movieParam.split('.')[0];
    const movie = allMovies.find(m => m.stream_id.toString() === rawId);
    if (movie) {
        return res.redirect(301, movie.video_url);
    }
    return res.redirect(301, 'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4');
});

app.listen(PORT, () => console.log(`Xtream Mock Server running on port ${PORT}`));
