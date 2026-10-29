const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

const CREDENTIALS = {
    username: "demosinetech",
    password: "demosinetech",
    server_name: "Sinetech Pro IPTV Demo"
};

// 1. Gerçek Canlı Yayın Akışları (Live TV - M3U8 HLS)
const liveStreamsPool = [
    { name: "NASA TV HD (Uzay Canlı Yayını)", icon: "https://www.nasa.gov/wp-content/uploads/2023/06/nasa-logo-web-rgb.png", url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-TV-HD-1/master.m3u8" },
    { name: "Global Test Live Feed 1", icon: "https://test-streams.mux.dev/x36xhzz/poster.jpg", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    { name: "Akamai Live Stream Test", icon: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500", url: "https://cph-p2p-ms.akamaized.net/hls/live/2000341/test/index.m3u8" },
    { name: "Apple Event Test Stream", icon: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_advanced/bipbop_16x9_variant.m3u8" },
    { name: "Studio Broadcast Feed", icon: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500", url: "https://test-streams.mux.dev/playlist.m3u8" }
];

// 2. Blender Vakfı & Apple Açık Kaynak Kaliteli Filmler (VOD)
const movieVideosPool = [
    { title: "Big Buck Bunny (Blender Vakfı - 1080p)", url: "https://content.jwplatform.com/manifests/vM7nH0Kl.m3u8", poster: "https://peach.blender.org/wp-content/uploads/title-anims-01.jpg" },
    { title: "Sintel (Destansı Animasyon Filmi)", url: "https://demo.unified-streaming.com/k8s/features/stable/video/sintel/sintel.ism/.m3u8", poster: "https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg" },
    { title: "Tears of Steel (Bilim Kurgu / VFX)", url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8", poster: "https://mango.blender.org/wp-content/uploads/2012/12/tos_poster.jpg" },
    { title: "Elephant's Dream (İlk Açık Film)", url: "https://demo.unified-streaming.com/k8s/features/stable/video/elephants-dream/elephants-dream.ism/.m3u8", poster: "https://orange.blender.org/wp-content/themes/orange/images/media_splash.jpg" },
    { title: "Apple Advanced Video Test", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/index.m3u8", poster: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=500" }
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
        name: `Blender & Apple Film #${i}: ${template.title}`,
        title: `Blender & Apple Film #${i}: ${template.title}`,
        stream_type: "movie",
        stream_icon: template.poster,
        rating: "9.2",
        rating_count_tot: 2500,
        year: 2023,
        genre: "Animation, Sci-Fi, Open Source",
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
            { category_id: "1", category_name: "Canlı TV 1 (NASA & Uzay)", parent_id: 0 },
            { category_id: "2", category_name: "Canlı TV 2 (Global Feed)", parent_id: 0 },
            { category_id: "3", category_name: "Canlı TV 3 (Akamai Test)", parent_id: 0 },
            { category_id: "4", category_name: "Canlı TV 4 (Apple Stream)", parent_id: 0 },
            { category_id: "5", category_name: "Canlı TV 5 (Studio Feed)", parent_id: 0 }
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
            { category_id: "10", category_name: "🍿 Blender & Apple Açık Kaynak Filmler (VOD)", parent_id: 0 }
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
                description: "Blender Vakfı ve Apple açık kaynak yüksek kaliteli film prodüksiyonudur.",
                genre: movie.genre,
                releasedate: `${movie.year}-01-01`,
                rating: movie.rating
            },
            movie_data: { stream_id: movie.stream_id, container_extension: "m3u8" }
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
    return res.redirect(301, 'https://ntv1.akamaized.net/hls/live/2014075/NASA-TV-HD-1/master.m3u8');
});

app.get('/live/:username/:password/:streamParam', (req, res) => {
    const rawId = req.params.streamParam.split('.')[0];
    const stream = allLiveStreams.find(s => s.stream_id.toString() === rawId);
    if (stream) {
        return res.redirect(301, stream.direct_source);
    }
    return res.redirect(301, 'https://ntv1.akamaized.net/hls/live/2014075/NASA-TV-HD-1/master.m3u8');
});

app.get('/movie/:username/:password/:movieParam', (req, res) => {
    const rawId = req.params.movieParam.split('.')[0];
    const movie = allMovies.find(m => m.stream_id.toString() === rawId);
    if (movie) {
        return res.redirect(301, movie.video_url);
    }
    return res.redirect(301, 'https://content.jwplatform.com/manifests/vM7nH0Kl.m3u8');
});

app.listen(PORT, () => console.log(`Xtream Mock Server running on port ${PORT}`));
