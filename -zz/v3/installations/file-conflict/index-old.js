const CHANNELS = {
    paintings: { slug: "butterfly-march-ju39hqrtn-k", container: ".slideshow-frame" },
}

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
    localStorage.getItem(`description-${slug}`) ? null : localStorage.setItem(`description-${slug}`, JSON.stringify(descriptions));
}

async function sliderImages() {
    const paramName = 'title'
    function resetURL() {
            const url = new URL(window.location.href.toLowerCase())
            url.searchParams.delete(paramName)
            window.history.pushState({}, '', url)
    }
    // log the url to the console
    function getURLParameter(name) {
            const url = new URL(window.location.href.toLowerCase())
            result = url.searchParams.get(name)
            if (!result) return
            result = result.replace(/['"]+/g, '')
            return result
    }

    const tile = localStorage.getItem('installation_slug') ? localStorage.getItem('installation_slug') : getURLParameter(paramName)

    if (tile === getURLParameter(paramName)) {
            CHANNELS.paintings.slug = tile

    } else if (tile !== getURLParameter(paramName)) {
            localStorage.setItem('installation_slug', tile)
            CHANNELS.paintings.slug = localStorage.getItem('installation_slug')
    }

    await renderImages(CHANNELS.paintings.slug, CHANNELS.paintings.container).then(() => {
            handleSlider()
    })
    resetURL()
}


function handleSlider() {
    const images = document.querySelectorAll(".slide")
    const imageCount = images.length
    const nextBtn = document.querySelector('.right__btn')
    const prevBtn = document.querySelector('.left__btn')
    const caption = document.querySelector('.slideshow-caption')
    const current = document.getElementById('current')
    const total = document.getElementById('total')
    const descriptions = JSON.parse(localStorage.getItem(`description-${CHANNELS.paintings.slug}`))
    let count = 0
    
    current.textContent = count + 1
    total.textContent = imageCount
    caption.innerHTML = descriptions[images[count].dataset.title] 


    function updateActiveImage(offset) {
            images[count].classList.remove("active");
            count = (count + offset + imageCount) % imageCount;
            images[count].classList.add("active");
            const title = images[count].dataset.title;
            current.textContent = count + 1;
            total.textContent = imageCount;
    }

    function showNextImage() {
            updateActiveImage(1);
    }


    function showPrevImage() {
            updateActiveImage(-1);
    }

    function keyPressed(e) {
            e = e || window.event
            if (e.keyCode == '37') showPrevImage()
            if (e.keyCode == '39') showNextImage()
    }


    nextBtn.addEventListener('click', showNextImage)
    prevBtn.addEventListener('click', showPrevImage)
    document.addEventListener('keydown', keyPressed)
}


window.onload = () => {
    sliderImages()
}