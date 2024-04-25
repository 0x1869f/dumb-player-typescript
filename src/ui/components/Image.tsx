type Props = {
  url: string
  className: string
}

export function Image({
  url,
  className
}: Props) {
  return url
    ? <div className="flex content-center">
      <img className={className} alt="" src={url} />
    </div>
    : <div className={className}></div>
}

