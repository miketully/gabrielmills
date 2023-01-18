const CHANNELS = {
        paintings: { slug: "paintings-gabriel-mills", container: ".slideshow-frame" },
}

// Get Data from Arena 
async function handleArenaContent(channel) {
       const randomString = Math.random().toString(16).slice(2)
       console.log(randomString)
        const contentUrl = `https://api.are.na/v2/channels/${channel}?sort=position&order=asc&per=100?nocache=${randomString}`
        return fetch(contentUrl).then(data => data.json())
}

async function renderImages(slug, containerID) {
        const data = await handleArenaContent(slug)
        const imgList = document.querySelector(containerID)
        const descriptions = {}
        const renderTitle = (cnt, index) => {
                const li = document.createElement('li')
                li.classList.add("slide") 
                li.setAttribute("data-title", `${cnt.title.toLowerCase()}`)
                if (index === 0) li.classList.add("active")
                const img = document.createElement('img')
                img.src = `${cnt.image.original.url}`
                img.alt = `${cnt.title}`
                li.appendChild(img)
                imgList.append(li)
                descriptions[cnt.title.toLowerCase()] = cnt.description_html
        }

        [...data.contents].reverse().forEach((cnt, idx) => {
                renderTitle(cnt, idx)
        })
        localStorage.getItem('descriptions') ? null : localStorage.setItem("descriptions", JSON.stringify(descriptions));
}

async function sliderImages() {
        await renderImages(CHANNELS.paintings.slug, CHANNELS.paintings.container).then(()=>{
                handleSlider() 
        })
}

function handleSlider() {
        const images = document.querySelectorAll(".slide")
        const imageCount = images.length
        const nextBtn = document.querySelector('.right__btn')
        const prevBtn = document.querySelector('.left__btn')
        const caption = document.querySelector('.slideshow-caption')
        const current = document.getElementById('current')
        const total = document.getElementById('total')
        const descriptions = JSON.parse(localStorage.getItem('descriptions'))
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
                images[count].classList.remove("active");
                count = (count + offset + imageCount) % imageCount;
                images[count].classList.add("active");
                const title = images[count].dataset.title;
                getDescripton(title);
                current.textContent = count + 1;
                total.textContent = imageCount;
        }

        function showNextImage() {
                updateActiveImage(1);
        }

        function showThisImage(tile){
                resetURL()
                const index = [...images].findIndex(img => img.dataset.title === tile);
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
                if (!desc) return
                caption.innerHTML = desc
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


window.onload = () => {
        sliderImages()
}