import axios, { AxiosResponse } from 'axios'
import { GraphQLResponse, MediaData, ResourceInfo } from '@/types'
import dayjs from 'dayjs'

const headers = {
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Content-Type': 'application/x-www-form-urlencoded',
  'X-FB-Friendly-Name': 'PolarisPostActionLoadPostQueryQuery',
  'X-CSRFToken': 'RVDUooU5MYsBbS1CNN3CzVAuEP8oHB52',
  'X-IG-App-ID': '1217981644879628',
  'X-FB-LSD': 'AVqbxe3J_YA',
  'X-ASBD-ID': '129477',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36'
}

export default class Ig {
  public shortcode: string | null = null

  constructor(url?: string) {
    if (url) {
      this.shortcode = this.parseShortcodeFromUrl(url)
    }
  }

  private getRequestBody(): string {
    const requestData = {
      av: '0',
      __d: 'www',
      __user: '0',
      __a: '1',
      __req: '3',
      __hs: '19624.HYP:instagram_web_pkg.2.1..0.0',
      dpr: '3',
      __ccg: 'UNKNOWN',
      __rev: '1008824440',
      __s: 'xf44ne:zhh75g:xr51e7',
      __hsi: '7282217488877343271',
      __dyn:
        '7xeUmwlEnwn8K2WnFw9-2i5U4e0yoW3q32360CEbo1nEhw2nVE4W0om78b87C0yE5ufz81s8hwGwQwoEcE7O2l0Fwqo31w9a9x-0z8-U2zxe2GewGwso88cobEaU2eUlwhEe87q7-0iK2S3qazo7u1xwIw8O321LwTwKG1pg661pwr86C1mwraCg',
      __csr:
        'gZ3yFmJkillQvV6ybimnG8AmhqujGbLADgjyEOWz49z9XDlAXBJpC7Wy-vQTSvUGWGh5u8KibG44dBiigrgjDxGjU0150Q0848azk48N09C02IR0go4SaR70r8owyg9pU0V23hwiA0LQczA48S0f-x-27o05NG0fkw',
      __comet_req: '7',
      lsd: 'AVqbxe3J_YA',
      jazoest: '2957',
      __spin_r: '1008824440',
      __spin_b: 'trunk',
      __spin_t: '1695523385',
      fb_api_caller_class: 'RelayModern',
      fb_api_req_friendly_name: 'PolarisPostActionLoadPostQueryQuery',
      variables: JSON.stringify({
        shortcode: this.shortcode,
        fetch_comment_count: 'null',
        fetch_related_profile_media_count: 'null',
        parent_comment_count: 'null',
        child_comment_count: 'null',
        fetch_like_count: 'null',
        fetch_tagged_user_count: 'null',
        fetch_preview_comment_count: 'null',
        has_threaded_comments: 'false',
        hoisted_comment_id: 'null',
        hoisted_reply_id: 'null'
      }),
      server_timestamps: 'true',
      doc_id: '10015901848480474'
    }
    return new URLSearchParams(requestData).toString()
  }

  private async requestData(): Promise<GraphQLResponse> {
    try {
      const res: AxiosResponse = await axios({
        url: 'https://www.instagram.com/api/graphql',
        method: 'post',
        headers: headers,
        data: this.getRequestBody()
      })
      if (res.status !== 200) {
        throw new Error('Request to Instagram Error')
      }
      if (!res.data.data?.xdt_shortcode_media) {
        throw new Error('No Content')
      }
      return res.data
    } catch (e) {
      console.log('请求错误：', e)
      throw new Error('Data Request Error')
    }
  }

  public async getData(shortcode?: string) {
    if (shortcode) {
      this.shortcode = shortcode
    }
    if (!this.shortcode) {
      throw new Error('Url or Shortcode is Not Defined')
    }
    const data = await this.requestData()
    return this.formatToResourceInfo(data.data?.xdt_shortcode_media)
  }

  public formatToResourceInfo(mediaData?: MediaData): ResourceInfo[] {
    if (!mediaData) {
      return []
    }
    const nodes = mediaData.edge_sidecar_to_children
    if (nodes) {
      return nodes.edges.map((node) => ({
        ...this.formatToResourceInfo(node.node)[0]
      }))
    }
    if (mediaData.is_video) {
      return [
        {
          filename: `ig-video-${dayjs().format('YYYY-MM-DDTHH:mm:ss')}.mp4`,
          width: mediaData.dimensions.width,
          height: mediaData.dimensions.height,
          url: mediaData.video_url,
          type: 'Video'
        }
      ]
    } else {
      const imageData = mediaData.display_resources.at(-1)
      return [
        {
          filename: `ig-img-${dayjs().format('YYYY-MM-DDTHH:mm:ss')}.jpeg`,
          width: imageData?.config_width ?? 0,
          height: imageData?.config_height ?? 0,
          url: imageData?.src ?? '',
          type: 'Image'
        }
      ]
    }
  }

  private parseShortcodeFromUrl(url: string): string {
    const matchShortcodeReg = /\/(?:p|reel|tv)\/([a-zA-Z0-9_\-]+)/
    const matcher = url.match(matchShortcodeReg)
    if (!matcher) {
      throw new Error('No Shortcode Found in Url!')
    }
    return matcher[1]
  }
}
