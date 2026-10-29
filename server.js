{\rtf1\ansi\ansicpg1254\cocoartf2907
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require('express');\
const app = express();\
const PORT = process.env.PORT || 3000;\
\
const CREDENTIALS = \{\
    username: "yt_demo_2024",\
    password: "demo123_secure",\
    server_name: "BasicPlayer Pro IPTV Demo"\
\};\
\
const demoMovies = [];\
const samplePosters = [\
    "https://peach.blender.org/wp-content/uploads/title-anims-01.jpg",\
    "https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg",\
    "https://mango.blender.org/wp-content/uploads/2012/12/tos_poster.jpg",\
    "https://gooseberry.blender.org/wp-content/uploads/2015/05/poster_01.jpg"\
];\
\
const sampleVideos = [\
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",\
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",\
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",\
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4"\
];\
\
for (let i = 1; i <= 50; i++) \{\
    demoMovies.push(\{\
        stream_id: 200 + i,\
        name: `Demo Film #$\{i\} - Open Source HD`,\
        title: `Demo Film #$\{i\} - Open Source HD`,\
        stream_type: "movie",\
        stream_icon: samplePosters[(i - 1) % samplePosters.length],\
        rating: (7.0 + (i % 3)).toFixed(1),\
        rating_count_tot: 500 + i * 12,\
        year: 2015 + (i % 8),\
        genre: i % 2 === 0 ? "Animation, Action" : "Sci-Fi, Comedy",\
        category_id: "10",\
        video_url: sampleVideos[(i - 1) % sampleVideos.length]\
    \});\
\}\
\
app.get('/player_api.php', (req, res) => \{\
    const \{ username, password, action \} = req.query;\
\
    if (username !== CREDENTIALS.username || password !== CREDENTIALS.password) \{\
        return res.json(\{ user_info: \{ auth: 0 \}, status: "Unauthorized" \});\
    \}\
\
    if (!action) \{\
        const hostUrl = req.protocol + '://' + req.get('host');\
        return res.json(\{\
            user_info: \{ username, password, auth: 1, status: "Active", exp_date: "1970534400" \},\
            server_info: \{ url: hostUrl, port: "80", https_port: "443", server_protocol: "https" \}\
        \});\
    \}\
\
    if (action === 'get_live_categories') return res.json([\{ category_id: "1", category_name: "\uc0\u55357 \u56628  Canl\u305  Test Yay\u305 nlar\u305 " \}]);\
    if (action === 'get_live_streams') return res.json([\
        \{ stream_id: 101, name: "NASA TV HD (Canl\uc0\u305  Uzay Yay\u305 n\u305 )", stream_type: "live", stream_icon: "https://www.nasa.gov/wp-content/uploads/2023/06/nasa-logo-web-rgb.png", category_id: "1" \},\
        \{ stream_id: 102, name: "Big Buck Bunny 24/7 D\'f6ng\'fc", stream_type: "live", stream_icon: "https://peach.blender.org/wp-content/uploads/title-anims-01.jpg", category_id: "1" \}\
    ]);\
\
    if (action === 'get_vod_categories') return res.json([\{ category_id: "10", category_name: "\uc0\u55356 \u57260  50 Adet Telifsiz Demo Film" \}]);\
    if (action === 'get_vod_streams') return res.json(demoMovies);\
\
    if (action === 'get_vod_info') \{\
        const vodId = parseInt(req.query.vod_id);\
        const movie = demoMovies.find(m => m.stream_id === vodId) || demoMovies[0];\
        return res.json(\{\
            info: \{ name: movie.name, movie_image: movie.stream_icon, description: "Telifsiz a\'e7\uc0\u305 k kaynakl\u305  demo film.", genre: movie.genre, rating: movie.rating \},\
            movie_data: \{ stream_id: movie.stream_id, container_extension: "mp4" \}\
        \});\
    \}\
\
    res.json(\{ error: "Unknown action" \});\
\});\
\
app.get('/live/:username/:password/:streamId.ts', (req, res) => \{\
    const \{ streamId \} = req.params;\
    if (streamId === '101') return res.redirect('https://ntv1.akamaized.net/hls/live/2014075/NASA-TV-HD-1/master.m3u8');\
    return res.redirect('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');\
\});\
\
app.get('/movie/:username/:password/:streamId.mp4', (req, res) => \{\
    const \{ streamId \} = req.params;\
    const movie = demoMovies.find(m => m.stream_id === parseInt(streamId));\
    return res.redirect(movie ? movie.video_url : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');\
\});\
\
app.listen(PORT, () => console.log(`Server running on port $\{PORT\}`));}