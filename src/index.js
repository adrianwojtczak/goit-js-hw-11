import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '36109480-a7bba8644b808a178437f4df3';
const API_URL = 'https://pixabay.com/api/';

const searchForm = document.getElementById('search-form');
const searchInput = searchForm.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';

loadMoreBtn.classList.add('is-hidden');

function smoothScreoll() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

async function performSearch(query) {
  const { data } = await axios.get(API_URL, {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: currentPage,
    },
  });

  if (data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  if (currentPage === 1) {
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  data.hits.forEach(hit => {
    const photoCard = createPhotoCard(hit);
    gallery.appendChild(photoCard);
  });

  if (currentPage >= Math.ceil(data.totalHits / 40)) {
    loadMoreBtn.classList.add('is-hidden');
  }

  if (currentPage !== 1 && currentPage >= Math.ceil(data.totalHits / 40)) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }

  // SimpleLightbox
  const lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
  });
}

async function onFormSubmit(ev) {
  ev.preventDefault();
  const inputValue = searchInput.value;

  if (inputValue.trim() === '') {
    return;
  }

  try {
    gallery.innerHTML = '';

    loadMoreBtn.classList.remove('is-hidden');

    currentPage = 1;
    currentQuery = inputValue;

    await performSearch(inputValue);
  } catch (error) {
    console.log(error);
  }
}

function createPhotoCard({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  const photoCard = document.createElement('div');
  photoCard.classList.add('photo-card');

  photoCard.innerHTML = `<a class="photo-card__link" href="${largeImageURL}" >
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        <span>${likes}</span>
      </p>
      <p class="info-item">
        <b>Views</b>
        <span>${views}</span>
      </p>
      <p class="info-item">
        <b>Comments</b>
        <span>${comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads</b>
        <span>${downloads}</span>
      </p>
    </div>`;

  return photoCard;
}

searchForm.addEventListener('submit', onFormSubmit);

async function onLoadMoreClick() {
  currentPage++;

  try {
    await performSearch(currentQuery);
    lightbox.refresh();
    smoothScreoll();
  } catch (error) {
    console.log(error);
  }
}

loadMoreBtn.addEventListener('click', onLoadMoreClick);
