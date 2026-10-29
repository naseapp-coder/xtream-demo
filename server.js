const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

const CREDENTIALS = {
    username: "demosinetech",
    password: "demosinetech",
    server_name: "Sinetech Pro IPTV Demo"
};

// En Stabil Çalışan Link (JW Player Big Buck Bunny / M3U8)
const STABLE_VIDEO_URL = "https://content.jwplatform.com/manifests/vM7nH0Kl.m3u8";

const moviePosters = [
    "https://peach.blender.org/wp-content/uploads/title-anims-01.jpg",
    "https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg",
    "https://mango.blender.org/wp-content/uploads/2012/12/tos_poster.jpg",
    "https://orange.blender.org/wp-content/themes/orange/images/media_splash.jpg",
    "https://gooseberry.blender.org/wp-content/uploads/2015/05/poster_01.jpg"
];

// 1. Filmler (VOD): 5 Kategori (Test 1 - Test 5) x 5 Film = 25 Film
const allMovies = [];
let movieIdCounter = 3000;
for (let cat = 1; cat <= 5; cat++) {
    for (let i = 1; i <= 5; i++) {
        movieIdCounter++;
        allMovies.push({
            stream_id: movieIdCounter,
            name: `Test ${cat} - Film #${i} (HD)`,
            title: `Test ${cat} - Film #${i} (HD)`,
            stream_type: "movie",
            stream_icon: moviePosters[(i - 1) % moviePosters.length],
            rating: "9.5",
            rating_count_tot: 1500,
            year: 2023,
            genre: `Test Genre ${cat}`,
            category_id: `${cat * 10}`,
            video_url: STABLE_VIDEO_URL,
            container_extension: "m3u8"
        });
    }
}

// 2. Diziler: 5 Kategori (Test 1 - Test 5) x 1 Dizi = 5 Dizi (Her dizide 5 bölüm)
const allSeries = [];
for (let cat = 1; cat <= 5; cat++) {
    allSeries.push({
        series_id: 500 + cat,
        name: `Test Dizi ${cat} - Özel Seri`,
        cover: moviePosters[(cat - 1) % moviePosters.length],
        category_id: `${cat * 100}`,
        rating: "9.8",
        genre: `Drama, Sci-Fi ${cat}`,
        plot: `Bu dizi Test ${cat} kategorisi altında yer alan 5 bölümlük özel test serisidir.`
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

    // Canlı TV (Boş bırakıldı)
    if (action === 'get_live_categories' || action === 'get_live_streams') {
        return res.json([]);
    }

    // Film Kategorileri (Test 1 - Test 5)
    if (action === 'get_vod_categories') {
        return res.json([
            { category_id: "10", category_name: "Test 1 (Filmler)", parent_id: 0 },
            { category_id: "20", category_name: "Test 2 (Filmler)", parent_id: 0 },
            { category_id: "30", category_name: "Test 3 (Filmler)", parent_id: 0 },
            { category_id: "40", category_name: "Test 4 (Filmler)", parent_id: 0 },
            { category_id: "50", category_name: "Test 5 (Filmler)", parent_id: 0 }
        ]);
    }

    if (action === 'get_vod_streams') {
        const catId = req.query.category_id;
        if (catId) {
            return res.json(allMovies.filter(m => m.category_id === catId));
        }
        return res.json(allMovies);
    }

    if (action === 'get_vod_info') {
        const vodId = parseInt(req.query.vod_id);
        const movie = allMovies.find(m => m.stream_id === vodId) || allMovies[0];
        return res.json({
            info: {
                name: movie.name,
                movie_image: movie.stream_icon,
                description: "Test film açıklaması ve detayları.",
                genre: movie.genre,
                releasedate: `${movie.year}-01-01`,
                rating: movie.rating
            },
            movie_data: { stream_id: movie.stream_id, container_extension: "m3u8" }
        });
    }

    // Dizi Kategorileri (Test 1 - Test 5)
    if (action === 'get_series_categories') {
        return res.json([
            { category_id: "100", category_name: "Test 1 (Diziler)", parent_id: 0 },
            { category_id: "200", category_name: "Test 2 (Diziler)", parent_id: 0 },
            { category_id: "300", category_name: "Test 3 (Diziler)", parent_id: 0 },
            { category_id: "400", category_name: "Test 4 (Diziler)", parent_id: 0 },
            { category_id: "500", category_name: "Test 5 (Diziler)", parent_id: 0 }
        ]);
    }

    if (action === 'get_series') {
        const catId = req.query.category_id;
        if (catId) {
            return res.json(allSeries.filter(s => s.category_id === catId));
        }
        return res.json(allSeries);
    }

    // Dizi Detayı (Her dizinin içinde 5 bölüm var)
    if (action === 'get_series_info') {
        const seriesId = parseInt(req.query.series_id);
        const series = allSeries.find(s => s.series_id === seriesId) || allSeries[0];
        
        const episodesList = [];
        for (let ep = 1; ep <= 5; ep++) {
            episodesList.push({
                id: `${series.series_id}0${ep}`,
                title: `${series.name} - Sezon 1 Bölüm ${ep}`,
                episode_num: ep,
                season: 1,
                container_extension: "m3u8",
                info: {
                    duration: "45 mins",
                    movie_image: series.cover
                }
            });
        }

        return res.json({
            info: {
                name: series.name,
                cover: series.cover,
                plot: series.plot,
                genre: series.genre,
                rating: series.rating
            },
            seasons: [
                { season_number: 1, name: "Sezon 1" }
            ],
            episodes: {
                "1": episodesList
            }
        });
    }

    res.json({ error: "Unknown action" });
});

// Yönlendirmeler (Film ve Diziler için stabil link)
app.get('/movie/:username/:password/:movieParam', (req, res) => {
    return res.redirect(301, STABLE_VIDEO_URL);
});

app.get('/series/:username/:password/:seriesParam', (req, res) => {
    return res.redirect(301, STABLE_VIDEO_URL);
});

app.get('/:username/:password/:param', (req, res, next) => {
    const { username } = req.params;
    if (['player_api.php', 'live', 'movie', 'series'].includes(username)) {
        return next();
    }
    return res.redirect(301, STABLE_VIDEO_URL);
});

app.listen(PORT, () => console.log(`Xtream Mock Server running on port ${PORT}`));
