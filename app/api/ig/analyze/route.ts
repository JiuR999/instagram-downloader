import { NextRequest, NextResponse } from 'next/server';
import { isValidIgUrl } from '@/lib/utils'
import { AxiosError } from 'axios'
import Ig from '@/core/Ig';

export const runtime = 'edge'; // 关键：指定 Edge Runtime

/* export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock 数据
  const mockResponse = {
    success: true,
    resources: [
      {
        filename: "ig_photo_2023_01.jpg",
        width: 1080,
        height: 1350,
        // 使用 Picsum 获取随机图
        url: "https://picsum.photos/1080/1350?random=1",
        type: "image"
      },
      {
        filename: "ig_reel_beach_vibe.mp4",
        width: 1080,
        height: 1920,
        // 使用公共测试视频
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        type: "video"
      },
       {
        filename: "ig_photo_carousel_02.jpg",
        width: 1080,
        height: 1080,
        url: "https://picsum.photos/1080/1080?random=2",
        type: "image"
      }
    ]
  };

  return NextResponse.json(mockResponse);
} */

export async function GET(req: NextRequest) {
    const postUrl = req.nextUrl.searchParams.get('url')
    if (!isValidIgUrl(postUrl)) {
        return NextResponse.json(
            {
                message: 'Not a valid Instagram share link.'
            },
            { status: 400 }
        )
    }
    try {
        const ig = new Ig(postUrl as string)
        const info = await ig.getData()
        return NextResponse.json(
            {
                data: info
            },
            { status: 200 }
        )
    } catch (e) {
        return NextResponse.json(
            {
                message: (e as AxiosError).message
            },
            { status: 500 }
        )
    }
}
