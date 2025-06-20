import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  TextInput,
} from "flowbite-react";

function NavBars() {
  return (
    <Navbar fluid className='fixed top-0 left-0 right-0 z-50 bg-blue-500'>
      <NavbarBrand href='https://flowbite-react.com'>
        {/* <img
          src='/favicon.svg'
          className='mr-3 h-6 sm:h-9'
          alt='Flowbite React Logo'
        /> */}
        <span className='self-center mx-2 whitespace-nowrap text-xl font-semibold dark:text-white'>
          BOOKLAB
        </span>
      </NavbarBrand>
      <div className='flex md:order-2 gap-1'>
        <TextInput className='' id='Search' placeholder='Search' addon='@' />
        <Button>Sign In</Button>
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink href='#' active>
          New Books
        </NavbarLink>
        <NavbarLink href='#'>Recommendations</NavbarLink>
        <NavbarLink href='#'>Fiction</NavbarLink>
        <NavbarLink href='#'>Non-Fiction</NavbarLink>
        <NavbarLink href='#'>My Books</NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}

export default NavBars;
