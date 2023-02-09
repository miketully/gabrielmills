const CHANNELS = {
        videos: { slug: "videos-gabriel-mills", container: ".slideshow-frame" },
}
const caption = document.querySelector('.slideshow-caption')


// Get Data from Arena 
async function handleArenaContent(channel) {
       const randomString = Math.random().toString(16).slice(2)
        const contentUrl = `https://api.are.na/v2/channels/${channel}?sort=position&order=asc&per=100?nocache=${randomString}`
        return fetch(contentUrl).then(data => data.json())
}

async function renderImages(slug, containerID) {
        const data = await handleArenaContent(slug)
        const vidList = document.querySelector(containerID)
        const descriptions = {}
        const renderTitle = (cnt, index) => {
                const li = document.createElement('li')
                li.classList.add("slide") 
                li.classList.add("video")
                li.setAttribute("data-title", `${sanitizeString(cnt.title) }`)
                if (index === 0) {
                        li.classList.add("active")
                        caption.innerHTML = cnt.description_html
                }
                const vid = document.createElement('video')
                const source = document.createElement('source')
                source.setAttribute("src", cnt.attachment.url)
                source.setAttribute("type", "video/mp4")
                vid.setAttribute("controls", "controls")
                vid.appendChild(source)
                li.appendChild(vid)
                vidList.append(li)
                descriptions[sanitizeString(cnt.title)] = cnt.description_html
        }


        [...data.contents].reverse().forEach((cnt, idx) => {
                renderTitle(cnt, idx)
        })

        localStorage.getItem('vid-descriptions') ? null : localStorage.setItem("vid-descriptions", JSON.stringify(descriptions));
}

async function sliderImages() {
        await renderImages(CHANNELS.videos.slug, CHANNELS.videos.container).then(()=>{
                handleSlider() 
        })
}

function handleSlider() {
        const videos = document.querySelectorAll(".slide")
        const imageCount = videos.length
        const nextBtn = document.querySelector('.right__btn')
        const prevBtn = document.querySelector('.left__btn')
        const current = document.getElementById('current')
        const total = document.getElementById('total')
        const descriptions = JSON.parse(localStorage.getItem('vid-descriptions'))
        let count = 0
        const paramName = 'title'
        current.textContent = count + 1
        total.textContent = imageCount

        

        function resetURL() {
                const url = new URL(window.location.href.toLowerCase())
                url.searchParams.delete(paramName)
                window.history.pushState({}, '', url)
        }


        function updateActiveImage(offset) {
                videos[count].classList.remove("active");
                count = (count + offset + imageCount) % imageCount;
                videos[count].classList.add("active");
                const title = videos[count].dataset.title;
                getDescripton(title);
                current.textContent = count + 1;
                total.textContent = imageCount;
        }

        function showNextImage() {
                updateActiveImage(1);
        }

        function showThisImage(tile){
                resetURL()
                const index = [...videos].findIndex(vid => vid.dataset.title === tile);
                updateActiveImage(index - count);
        }

        function showPrevImage(){
                updateActiveImage(-1);
        }

        function keyPressed(e) {
                e = e || window.event
                if (e.keyCode == '37') showPrevImage()
                if (e.keyCode == '39') showNextImage()
        }

        function getDescripton(title) {
                const desc = descriptions[title]
                caption.innerHTML = desc || ''
        }

        // log the url to the console
        function getURLParameter(name) {
                const url = new URL(window.location.href.toLowerCase())
                result = url.searchParams.get(name)
                if (!result) return
                result = result.replace(/['"]+/g, '')
                return result
        }

        const tile = getURLParameter(paramName)
        if (tile) showThisImage(tile)

        nextBtn.addEventListener('click', showNextImage)
        prevBtn.addEventListener('click', showPrevImage)
        document.addEventListener('keydown', keyPressed)
}

function sanitizeString(str) {
        return str.replace(/[^a-zA-Z0-9 ]/g, "")
                .replace(/\s+/g, "_")
                .toLowerCase();
}


window.onload = () => {
        sliderImages()
}