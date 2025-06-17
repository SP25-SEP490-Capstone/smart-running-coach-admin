import { Link, useLocation } from 'react-router-dom'
import './CommonBreadcrumb.scss'
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';

interface IBreadcrumbItem {
  name: string
  link?: string
  className?: string
}

interface ICommonBreadcrumbProps {
  items: IBreadcrumbItem[]
  className?: string
}

export default function CommonBreadcrumb(props: ICommonBreadcrumbProps) {
  const { items, className } = props
  const location = useLocation()

  return (
    <div className={`common-breadcrumb ${className}`}>
      {items.map((item, index) => (
        <div key={index} className={`breadcrumb-item ${item.className}`}>
          {item.link ? (
            <Link to={item.link} className={location.pathname === item.link ? 'active' : ''}>
              {item.name}
            </Link>
          ) : (
            <span>{item.name}</span>
          )}
          {index !== items.length - 1 && (
            <span className='breadcrumb-separator'>
              <KeyboardArrowRightOutlinedIcon />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

