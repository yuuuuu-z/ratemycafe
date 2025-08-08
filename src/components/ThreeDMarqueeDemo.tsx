"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

export function ThreeDMarqueeDemo() {
  const images = [
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
    "https://qiniu.cambojob.com/2022-10-19-634fb7321eb8a.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/88/54/92/88549238-11e7-8103-2a81-60ee0c64c871/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg",
  ];
  return (
    <div className="mx-auto my-10 max-w-7xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
      <ThreeDMarquee images={images} />
    </div>
  );
}
