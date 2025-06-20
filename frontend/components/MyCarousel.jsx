import Slider from "react-slick";

function MyCarousel() {
  const settings = {
    dots: true,
    className: "center",
    centerMode: true,
    speed: 500,
    slidesToShow: 3,
    infinite: true,
    centerPadding: "10px",
    autoplay: true,
    autoplaySpeed: 3000,
    draggable: true,
    pauseOnHover: true,
  };
  return (
    <div className='slider-container'>
      <Slider {...settings}>
        <div className=' w-full h-[80vh]'>
          <img
            src='https://skyryedesign.com/wp-content/uploads/2016/04/56c6f9b7efad5-cover-books-design-illustrations.jpg'
            alt='Slide 1'
            className='w-auto h-[80vh] object-cover'
          />
        </div>
        <div className=' w-full h-[80vh]'>
          <img
            src='https://brittlepaper.com/wp-content/uploads/2021/06/81b6ahl1uL.jpeg'
            alt='Slide 1'
            className='w-auto h-[80vh] object-cover'
          />
        </div>
        <div>
          <img
            src='https://watkinspublishing.com/wp-content/uploads/2024/08/d0d227e0-232b-4cfe-90bf-c4ab16b9dc67.jpg'
            alt='Slide 2'
            className='w-auto h-[80vh] object-cover'
          />
        </div>
        <div>
          <img
            src='https://africanbookaddict.com/wp-content/uploads/2024/02/legachi.jpg'
            alt='Slide 3'
            className='w-auto h-[80vh] object-cover'
          />
        </div>
        <div>
          <img
            src='https://afrikanza.com/cdn/shop/articles/Things-Fall-Apart_709d5448-8bc3-428b-a2e5-571675442f6d_948x.jpg?v=1590689911'
            alt='Slide 4'
            className='w-auto h-[80vh] object-cover'
          />
        </div>
        <div>
          <img
            src='https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhB_Bmr5PxG1IB5pe9RU3ZqfomdGKPOO93cp7E0TL49ddb2MmADrnNUEGnyjf7Z3nf8yQJTjwuQRXTzJfykrnfKbY2fPSiaq8Cj7c4VRgXSoXtFX2YA3vsBtjeoXThSahWxQmnH_lgFHZ7B/s1600/afro_okechukwu-ofili.jpg'
            alt='Slide 5'
            className='w-auto h-[80vh] object-cover'
          />
        </div>
      </Slider>
    </div>
  );
}

export default MyCarousel;
