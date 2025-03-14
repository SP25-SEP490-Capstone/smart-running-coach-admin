import { useState } from 'react';
import './HomeLayout.scss'
import Sidebar from "@components/commons/Sidebar";
import Navbar from '@components/commons/Navbar';

export default function HomeLayout({ pageComponent }: any) {
  const [isShrink, setIsShrink] = useState(false);

  const toggleShrink = () => {
    setIsShrink(prevIsShrink => !prevIsShrink);
  };

  return (
    <div className="home-layout">
      <Sidebar isShrink={isShrink} toggleShrink={toggleShrink} />
      <div className='home-layout-content'>
        <Navbar />
        <div className={'page'}>
          {pageComponent}
        </div>
      </div>
    </div>
  )
}
