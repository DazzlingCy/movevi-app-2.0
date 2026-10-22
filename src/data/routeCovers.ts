/**
 * Route landmark covers in journey order. Wikimedia Commons, checked 2026-10-21.
 * Retain attribution when replacing images. Backend coverImage overrides these defaults.
 * Static URLs avoid Wikipedia API calls at runtime.
 */
export interface RouteCover {
  src: string;
  subject: string;
  source: string;
  credit: string;
  license: string;
  licenseUrl: string;
}

export const ROUTE_COVERS: Record<string, readonly RouteCover[]> = {
  "杭州": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/West_Lake_%E8%A5%BF%E6%B9%96_-_panoramio_%2810%29.jpg/960px-West_Lake_%E8%A5%BF%E6%B9%96_-_panoramio_%2810%29.jpg",
      "subject": "Broken Bridge (Hangzhou)",
      "source": "https://commons.wikimedia.org/wiki/File:West_Lake_%E8%A5%BF%E6%B9%96_-_panoramio_(10).jpg",
      "credit": "lienyuan lee",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/Bai_Causeway.jpg/960px-Bai_Causeway.jpg",
      "subject": "白堤",
      "source": "https://commons.wikimedia.org/wiki/File:Bai_Causeway.jpg",
      "credit": "钉钉",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/West_Lake%2C_Hangzhou_2025.jpg/960px-West_Lake%2C_Hangzhou_2025.jpg",
      "subject": "West Lake",
      "source": "https://commons.wikimedia.org/wiki/File:West_Lake,_Hangzhou_2025.jpg",
      "credit": "Takashishin",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Lingyin_Temple%2C_Hangzhou_20161003.jpg/960px-Lingyin_Temple%2C_Hangzhou_20161003.jpg",
      "subject": "Lingyin Temple",
      "source": "https://commons.wikimedia.org/wiki/File:Lingyin_Temple,_Hangzhou_20161003.jpg",
      "credit": "Tyg728",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/95/BaoChuTa.jpg",
      "subject": "Baochu Pagoda",
      "source": "https://commons.wikimedia.org/wiki/File:BaoChuTa.jpg",
      "credit": "Chrisguilbeau (talk) (Uploads)",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Tea_plantation_in_hangzhou.JPG/960px-Tea_plantation_in_hangzhou.JPG",
      "subject": "Longjing, Hangzhou",
      "source": "https://commons.wikimedia.org/wiki/File:Tea_plantation_in_hangzhou.JPG",
      "credit": "Shizhao",
      "license": "CC BY 1.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/1.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_3.jpg/960px-%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_3.jpg",
      "subject": "Qianjiang New City",
      "source": "https://commons.wikimedia.org/wiki/File:%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_3.jpg",
      "credit": "EditQ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/%E6%8B%B1%E5%AE%B8%E6%A9%8B%C2%B7%E6%B5%99%E6%B1%9F%E6%9D%AD%E5%B7%9E%C2%B7%EF%BC%88%E8%88%AA%E6%8B%8D%E8%87%AA%E6%9D%B1%E5%8D%97%E5%BE%80%E8%A5%BF%E5%8C%97%EF%BC%89.jpg/960px-%E6%8B%B1%E5%AE%B8%E6%A9%8B%C2%B7%E6%B5%99%E6%B1%9F%E6%9D%AD%E5%B7%9E%C2%B7%EF%BC%88%E8%88%AA%E6%8B%8D%E8%87%AA%E6%9D%B1%E5%8D%97%E5%BE%80%E8%A5%BF%E5%8C%97%EF%BC%89.jpg",
      "subject": "Gongchen Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:%E6%8B%B1%E5%AE%B8%E6%A9%8B%C2%B7%E6%B5%99%E6%B1%9F%E6%9D%AD%E5%B7%9E%C2%B7%EF%BC%88%E8%88%AA%E6%8B%8D%E8%87%AA%E6%9D%B1%E5%8D%97%E5%BE%80%E8%A5%BF%E5%8C%97%EF%BC%89.jpg",
      "credit": "Legolas1024",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Jiuxiyanshu.JPG/960px-Jiuxiyanshu.JPG",
      "subject": "九溪烟树",
      "source": "https://commons.wikimedia.org/wiki/File:Jiuxiyanshu.JPG",
      "credit": "上传者：Shizhao",
      "license": "CC BY 1.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/1.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Leifeng_Pagoda_DJI_0593_%282%29.jpg/960px-Leifeng_Pagoda_DJI_0593_%282%29.jpg",
      "subject": "Leifeng Pagoda",
      "source": "https://commons.wikimedia.org/wiki/File:Leifeng_Pagoda_DJI_0593_(2).jpg",
      "credit": "David290",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
  "北京": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/The_Forbidden_City_-_View_from_Coal_Hill.jpg/960px-The_Forbidden_City_-_View_from_Coal_Hill.jpg",
      "subject": "Forbidden City",
      "source": "https://commons.wikimedia.org/wiki/File:The_Forbidden_City_-_View_from_Coal_Hill.jpg",
      "credit": "Pixelflake",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Temple_of_Heaven_20160323_01.jpg/960px-Temple_of_Heaven_20160323_01.jpg",
      "subject": "Temple of Heaven",
      "source": "https://commons.wikimedia.org/wiki/File:Temple_of_Heaven_20160323_01.jpg",
      "credit": "Shujianyang",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/95/Shishahai.jpg",
      "subject": "什刹海",
      "source": "https://commons.wikimedia.org/wiki/File:Shishahai.jpg",
      "credit": "用心阁 from zh.wikipedia",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/%E5%A5%A5%E6%9E%97%E5%8C%B9%E5%85%8B%E6%A3%AE%E6%9E%97%E5%85%AC%E5%9B%AD%E5%85%A8%E6%99%AF.jpg/960px-%E5%A5%A5%E6%9E%97%E5%8C%B9%E5%85%8B%E6%A3%AE%E6%9E%97%E5%85%AC%E5%9B%AD%E5%85%A8%E6%99%AF.jpg",
      "subject": "Olympic Forest Park",
      "source": "https://commons.wikimedia.org/wiki/File:%E5%A5%A5%E6%9E%97%E5%8C%B9%E5%85%8B%E6%A3%AE%E6%9E%97%E5%85%AC%E5%9B%AD%E5%85%A8%E6%99%AF.jpg",
      "credit": "Hoffnung2008",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Jingshan_park.jpg/960px-Jingshan_park.jpg",
      "subject": "Jingshan Park",
      "source": "https://commons.wikimedia.org/wiki/File:Jingshan_park.jpg",
      "credit": "Charlie fong冯成",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Jingshan_park.jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/65618-Beijing-Lama-Temple_%2828098480603%29.jpg/960px-65618-Beijing-Lama-Temple_%2828098480603%29.jpg",
      "subject": "Yonghe Temple",
      "source": "https://commons.wikimedia.org/wiki/File:65618-Beijing-Lama-Temple_(28098480603).jpg",
      "credit": "xiquinhosilva",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Liangma_River_at_Xinyuan_St_%2820200808164518%29.jpg/960px-Liangma_River_at_Xinyuan_St_%2820200808164518%29.jpg",
      "subject": "亮马河",
      "source": "https://commons.wikimedia.org/wiki/File:Liangma_River_at_Xinyuan_St_(20200808164518).jpg",
      "credit": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Longevity_Hill_of_the_Summer_Palace.jpg/960px-Longevity_Hill_of_the_Summer_Palace.jpg",
      "subject": "Summer Palace",
      "source": "https://commons.wikimedia.org/wiki/File:Longevity_Hill_of_the_Summer_Palace.jpg",
      "credit": "xiquinhosilva",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Chang%27anAvenuepic1.jpg/960px-Chang%27anAvenuepic1.jpg",
      "subject": "Chang'an Avenue",
      "source": "https://commons.wikimedia.org/wiki/File:Chang%27anAvenuepic1.jpg",
      "credit": "West Zest",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Qianmen_14_april_2010.jpg/960px-Qianmen_14_april_2010.jpg",
      "subject": "Zhengyangmen",
      "source": "https://commons.wikimedia.org/wiki/File:Qianmen_14_april_2010.jpg",
      "credit": "© Vyacheslav Argenberg, VascoPlanet.com",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0"
    }
  ],
  "上海": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Bund_2.jpg/960px-The_Bund_2.jpg",
      "subject": "The Bund",
      "source": "https://commons.wikimedia.org/wiki/File:The_Bund_2.jpg",
      "credit": "钉钉",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/27/Wukang_109.JPG",
      "subject": "Wukang Road",
      "source": "https://commons.wikimedia.org/wiki/File:Wukang_109.JPG",
      "credit": "Shypanda",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Suzhou_Creek_from_Waibaidu_Bridge%2C_Shanghai.jpg/960px-Suzhou_Creek_from_Waibaidu_Bridge%2C_Shanghai.jpg",
      "subject": "Suzhou Creek",
      "source": "https://commons.wikimedia.org/wiki/File:Suzhou_Creek_from_Waibaidu_Bridge,_Shanghai.jpg",
      "credit": "Daniel Case",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Century_Park_Shanghai%2C_fishing.jpg/960px-Century_Park_Shanghai%2C_fishing.jpg",
      "subject": "Century Park (Shanghai)",
      "source": "https://commons.wikimedia.org/wiki/File:Century_Park_Shanghai,_fishing.jpg",
      "credit": "Peripitus",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Sinan_Mansions_Shanghai.JPG/960px-Sinan_Mansions_Shanghai.JPG",
      "subject": "思南公馆",
      "source": "https://commons.wikimedia.org/wiki/File:Sinan_Mansions_Shanghai.JPG",
      "credit": "Livelikerw",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Shanghai_-_Yu_Garden_-_0035.jpg/960px-Shanghai_-_Yu_Garden_-_0035.jpg",
      "subject": "Yu Garden",
      "source": "https://commons.wikimedia.org/wiki/File:Shanghai_-_Yu_Garden_-_0035.jpg",
      "credit": "Stefan Fussan",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/West_Bund_Museum%2C_Shanghai%2C_Jun_2020.jpg/960px-West_Bund_Museum%2C_Shanghai%2C_Jun_2020.jpg",
      "subject": "西岸美术馆",
      "source": "https://commons.wikimedia.org/wiki/File:West_Bund_Museum,_Shanghai,_Jun_2020.jpg",
      "credit": "Lcsun",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg/960px-Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg",
      "subject": "Lujiazui",
      "source": "https://commons.wikimedia.org/wiki/File:Huangpu_Park_20124-Shanghai_(32208802494).jpg",
      "credit": "xiquinhosilva",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Costa.Allegra.Shanghai.jpg/960px-Costa.Allegra.Shanghai.jpg",
      "subject": "上海港国际客运中心",
      "source": "https://commons.wikimedia.org/wiki/File:Costa.Allegra.Shanghai.jpg",
      "credit": "Mario Biondi (writer)",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Waibaidu_Bridge_Shanghai.jpg/960px-Waibaidu_Bridge_Shanghai.jpg",
      "subject": "Waibaidu Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:Waibaidu_Bridge_Shanghai.jpg",
      "credit": "kallerna",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
  "西安": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Yongningmen_2016.jpg/960px-Yongningmen_2016.jpg",
      "subject": "永宁门",
      "source": "https://commons.wikimedia.org/wiki/File:Yongningmen_2016.jpg",
      "credit": "Shujianyang",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Giant_Wild_Goose_Pagoda.jpg/960px-Giant_Wild_Goose_Pagoda.jpg",
      "subject": "Giant Wild Goose Pagoda",
      "source": "https://commons.wikimedia.org/wiki/File:Giant_Wild_Goose_Pagoda.jpg",
      "credit": "Alex Kwok",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Daming_Palace_National_Heritage_Park_-_Danfeng_Gate_01.jpg/960px-Daming_Palace_National_Heritage_Park_-_Danfeng_Gate_01.jpg",
      "subject": "Daming Palace",
      "source": "https://commons.wikimedia.org/wiki/File:Daming_Palace_National_Heritage_Park_-_Danfeng_Gate_01.jpg",
      "credit": "xiquinhosilva",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/%E6%9B%B2%E6%B1%9F%E6%B1%A0%E5%85%AC%E5%9B%AD%E8%88%AA%E6%8B%8D%E5%9B%BE.jpg/960px-%E6%9B%B2%E6%B1%9F%E6%B1%A0%E5%85%AC%E5%9B%AD%E8%88%AA%E6%8B%8D%E5%9B%BE.jpg",
      "subject": "曲江池遗址公园",
      "source": "https://commons.wikimedia.org/wiki/File:%E6%9B%B2%E6%B1%9F%E6%B1%A0%E5%85%AC%E5%9B%AD%E8%88%AA%E6%8B%8D%E5%9B%BE.jpg",
      "credit": "Ghrkya",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Baoqing_Temple_Pagoda.jpg/960px-Baoqing_Temple_Pagoda.jpg",
      "subject": "书院门",
      "source": "https://commons.wikimedia.org/wiki/File:Baoqing_Temple_Pagoda.jpg",
      "credit": "赵文博",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Xi%27an_Muslim_Quarter.jpg/960px-Xi%27an_Muslim_Quarter.jpg",
      "subject": "Xi'an Muslim Quarter",
      "source": "https://commons.wikimedia.org/wiki/File:Xi%27an_Muslim_Quarter.jpg",
      "credit": "Qianeal",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/43/Xi%27anwildgoosepagoda2.JPG",
      "subject": "Small Wild Goose Pagoda",
      "source": "https://commons.wikimedia.org/wiki/File:Xi%27anwildgoosepagoda2.JPG",
      "credit": "Guucancat",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Xi%27anwildgoosepagoda2.JPG"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Xi%27an_Bell_Tower_2024.10.jpg/960px-Xi%27an_Bell_Tower_2024.10.jpg",
      "subject": "Bell Tower of Xi'an",
      "source": "https://commons.wikimedia.org/wiki/File:Xi%27an_Bell_Tower_2024.10.jpg",
      "credit": "xiquinhosilva",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg/960px-City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg",
      "subject": "Fortifications of Xi'an",
      "source": "https://commons.wikimedia.org/wiki/File:City_wall_of_Xi%27an_51550-Xian_(27959363326).jpg",
      "credit": "xiquinhosilva",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/The_Drum_Tower_of_Xi%27an.JPG/960px-The_Drum_Tower_of_Xi%27an.JPG",
      "subject": "Drum Tower of Xi'an",
      "source": "https://commons.wikimedia.org/wiki/File:The_Drum_Tower_of_Xi%27an.JPG",
      "credit": "Wang Zhongyin",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
  "东京": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Sensoji_2023.jpg/960px-Sensoji_2023.jpg",
      "subject": "Sensō-ji",
      "source": "https://commons.wikimedia.org/wiki/File:Sensoji_2023.jpg",
      "credit": "Akonnchiroll",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/7/73/Sumidagawa_river.JPG",
      "subject": "Sumida River",
      "source": "https://commons.wikimedia.org/wiki/File:Sumidagawa_river.JPG",
      "credit": "Kirkpatrick (talk)",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Seimon_Ishibashi.JPG/960px-Seimon_Ishibashi.JPG",
      "subject": "Tokyo Imperial Palace",
      "source": "https://commons.wikimedia.org/wiki/File:Seimon_Ishibashi.JPG",
      "credit": "Kakidai",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Tokyo_%E6%9D%B1%E4%BA%AC_%2851335433586%29.jpg/960px-Tokyo_%E6%9D%B1%E4%BA%AC_%2851335433586%29.jpg",
      "subject": "Yoyogi Park",
      "source": "https://commons.wikimedia.org/wiki/File:Tokyo_%E6%9D%B1%E4%BA%AC_(51335433586).jpg",
      "credit": "Melvin Loi from Macau, Macau",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/KagurazakaStreet.JPG/960px-KagurazakaStreet.JPG",
      "subject": "Kagurazaka",
      "source": "https://commons.wikimedia.org/wiki/File:KagurazakaStreet.JPG",
      "credit": "PHGCOM",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Tokyo_-_Yanaka_143.jpg/960px-Tokyo_-_Yanaka_143.jpg",
      "subject": "Yanaka, Tokyo",
      "source": "https://commons.wikimedia.org/wiki/File:Tokyo_-_Yanaka_143.jpg",
      "credit": "Joe Mabel",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Tokyo_Metropolitan_Art_Museum_01_%2815133033473%29.jpg/960px-Tokyo_Metropolitan_Art_Museum_01_%2815133033473%29.jpg",
      "subject": "東京都美術館",
      "source": "https://commons.wikimedia.org/wiki/File:Tokyo_Metropolitan_Art_Museum_01_(15133033473).jpg",
      "credit": "Joe Mabel on Flickr as Joe Mabel from Seattle, US",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Tokyo_Tower_2023.jpg/960px-Tokyo_Tower_2023.jpg",
      "subject": "Tokyo Tower",
      "source": "https://commons.wikimedia.org/wiki/File:Tokyo_Tower_2023.jpg",
      "credit": "Akonnchiroll",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Odaiba_close_up_-_2025_Jan_14_01-27PM.jpeg/960px-Odaiba_close_up_-_2025_Jan_14_01-27PM.jpeg",
      "subject": "Odaiba",
      "source": "https://commons.wikimedia.org/wiki/File:Odaiba_close_up_-_2025_Jan_14_01-27PM.jpeg",
      "credit": "Nesnad",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Yamanote-Line-E235.jpg/960px-Yamanote-Line-E235.jpg",
      "subject": "Yamanote Line",
      "source": "https://commons.wikimedia.org/wiki/File:Yamanote-Line-E235.jpg",
      "credit": "MaedaAkihiko",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
  "巴黎": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/West_facade_of_the_Cour_Carr%C3%A9e%2C_Louvre_Palace%2C_Paris_5_October_2017.jpg/960px-West_facade_of_the_Cour_Carr%C3%A9e%2C_Louvre_Palace%2C_Paris_5_October_2017.jpg",
      "subject": "Louvre Palace",
      "source": "https://commons.wikimedia.org/wiki/File:West_facade_of_the_Cour_Carr%C3%A9e,_Louvre_Palace,_Paris_5_October_2017.jpg",
      "credit": "Ali Sabbagh",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/d/df/Pont_paris_iledelacit%C3%A9_a_saintmichel.jpg",
      "subject": "Pont Saint-Michel",
      "source": "https://commons.wikimedia.org/wiki/File:Pont_paris_iledelacit%C3%A9_a_saintmichel.jpg",
      "credit": "Photographe amateur, Photographie prise par François Trazzi",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Notre-Dame_de_Paris%2C_4_October_2017.jpg/960px-Notre-Dame_de_Paris%2C_4_October_2017.jpg",
      "subject": "Notre-Dame de Paris",
      "source": "https://commons.wikimedia.org/wiki/File:Notre-Dame_de_Paris,_4_October_2017.jpg",
      "credit": "Ali Sabbagh",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/LuxembourgMontparnasse.JPG/960px-LuxembourgMontparnasse.JPG",
      "subject": "Jardin du Luxembourg",
      "source": "https://commons.wikimedia.org/wiki/File:LuxembourgMontparnasse.JPG",
      "credit": "Kirua",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:LuxembourgMontparnasse.JPG"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/View_from_Notre-Dame_de_Paris%2C_24_June_2014_004.jpg/960px-View_from_Notre-Dame_de_Paris%2C_24_June_2014_004.jpg",
      "subject": "Montmartre",
      "source": "https://commons.wikimedia.org/wiki/File:View_from_Notre-Dame_de_Paris,_24_June_2014_004.jpg",
      "credit": "Navin75",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Paris_Hotel_de_Sens_dsc04028.jpg/960px-Paris_Hotel_de_Sens_dsc04028.jpg",
      "subject": "The Marais",
      "source": "https://commons.wikimedia.org/wiki/File:Paris_Hotel_de_Sens_dsc04028.jpg",
      "credit": "上传者：David.Monniaux",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Gare_d%27Orsay_%2849570190081%29.jpg/960px-Gare_d%27Orsay_%2849570190081%29.jpg",
      "subject": "奥赛博物馆",
      "source": "https://commons.wikimedia.org/wiki/File:Gare_d%27Orsay_(49570190081).jpg",
      "credit": "Cheng-en Cheng from Taichung City, Taiwan",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/960px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
      "subject": "Eiffel Tower",
      "source": "https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons_(cropped).jpg",
      "credit": "Benh LIEU SONG",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons_(cropped).jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Avenue_des_Champs-%C3%89lys%C3%A9es_July_24%2C_2009_N1.jpg/960px-Avenue_des_Champs-%C3%89lys%C3%A9es_July_24%2C_2009_N1.jpg",
      "subject": "Champs-Élysées",
      "source": "https://commons.wikimedia.org/wiki/File:Avenue_des_Champs-%C3%89lys%C3%A9es_July_24,_2009_N1.jpg",
      "credit": "Josh Hallett",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Pont_Alexandre_III_depuis_pont_de_la_Concorde_Paris.jpg/960px-Pont_Alexandre_III_depuis_pont_de_la_Concorde_Paris.jpg",
      "subject": "Pont Alexandre III",
      "source": "https://commons.wikimedia.org/wiki/File:Pont_Alexandre_III_depuis_pont_de_la_Concorde_Paris.jpg",
      "credit": "Jebulon",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    }
  ],
  "伦敦": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster%2C_London.jpg/960px-Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster%2C_London.jpg",
      "subject": "Big Ben",
      "source": "https://commons.wikimedia.org/wiki/File:Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster,_London.jpg",
      "credit": "Christian David",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/London_Eye_Jan_2006.jpg/960px-London_Eye_Jan_2006.jpg",
      "subject": "South Bank",
      "source": "https://commons.wikimedia.org/wiki/File:London_Eye_Jan_2006.jpg",
      "credit": "Diliff",
      "license": "CC BY 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.5"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/960px-Tower_Bridge_at_Dawn.jpg",
      "subject": "Tower Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:Tower_Bridge_at_Dawn.jpg",
      "credit": "Fuzzypiggy",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Hyde_Park_London_from_the_air.jpg/960px-Hyde_Park_London_from_the_air.jpg",
      "subject": "Hyde Park, London",
      "source": "https://commons.wikimedia.org/wiki/File:Hyde_Park_London_from_the_air.jpg",
      "credit": "@LondonNPC #NationalParkCity",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Covent_Garden_Interior_May_2006_crop.jpg/960px-Covent_Garden_Interior_May_2006_crop.jpg",
      "subject": "Covent Garden",
      "source": "https://commons.wikimedia.org/wiki/File:Covent_Garden_Interior_May_2006_crop.jpg",
      "credit": "Covent_Garden_Interior_May_2006.jpg: Diliff derivative work: SilkTork (talk)",
      "license": "CC BY 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.5"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/0/04/London_110.jpg",
      "subject": "Notting Hill",
      "source": "https://commons.wikimedia.org/wiki/File:London_110.jpg",
      "credit": "Urban",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Tate_Modern_-_Bankside_Power_Station.jpg/960px-Tate_Modern_-_Bankside_Power_Station.jpg",
      "subject": "Tate Modern",
      "source": "https://commons.wikimedia.org/wiki/File:Tate_Modern_-_Bankside_Power_Station.jpg",
      "credit": "Acabashi",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/The_Shard_at_sunset_2017_%28cropped%29.jpg/960px-The_Shard_at_sunset_2017_%28cropped%29.jpg",
      "subject": "The Shard",
      "source": "https://commons.wikimedia.org/wiki/File:The_Shard_at_sunset_2017_(cropped).jpg",
      "credit": "Colin",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Regents_Canal%2C_London%2C_England_-Islington_tunnel-21March2010.jpg/960px-Regents_Canal%2C_London%2C_England_-Islington_tunnel-21March2010.jpg",
      "subject": "Regent's Canal",
      "source": "https://commons.wikimedia.org/wiki/File:Regents_Canal,_London,_England_-Islington_tunnel-21March2010.jpg",
      "credit": "Mark Hogan from London, UK, USA",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Westminster_Bridge_and_Palace_of_Westminster.jpg/960px-Westminster_Bridge_and_Palace_of_Westminster.jpg",
      "subject": "Westminster Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:Westminster_Bridge_and_Palace_of_Westminster.jpg",
      "credit": "Martin Dunst",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
  "纽约": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Brooklyn_Bridge_and_the_Lower_Manhattan_skyline_from_Pebble_Beach%2C_New_York.jpg/960px-Brooklyn_Bridge_and_the_Lower_Manhattan_skyline_from_Pebble_Beach%2C_New_York.jpg",
      "subject": "Brooklyn Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:Brooklyn_Bridge_and_the_Lower_Manhattan_skyline_from_Pebble_Beach,_New_York.jpg",
      "credit": "Christian David",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Hudson_river_from_bear_mountain_bridge.jpg/960px-Hudson_river_from_bear_mountain_bridge.jpg",
      "subject": "Hudson River",
      "source": "https://commons.wikimedia.org/wiki/File:Hudson_river_from_bear_mountain_bridge.jpg",
      "credit": "上传者：Nordelch",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/High_Line_Park%2C_Section_1a.jpg/960px-High_Line_Park%2C_Section_1a.jpg",
      "subject": "High Line",
      "source": "https://commons.wikimedia.org/wiki/File:High_Line_Park,_Section_1a.jpg",
      "credit": "Dansnguyen",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Global_Citizen_Festival_Central_Park_New_York_City_from_NYonAir_%2815351915006%29.jpg/960px-Global_Citizen_Festival_Central_Park_New_York_City_from_NYonAir_%2815351915006%29.jpg",
      "subject": "Central Park",
      "source": "https://commons.wikimedia.org/wiki/File:Global_Citizen_Festival_Central_Park_New_York_City_from_NYonAir_(15351915006).jpg",
      "credit": "Anthony Quintano from Hillsborough, NJ, United States",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Greenwich_Village_%2827483343909%29.jpg/960px-Greenwich_Village_%2827483343909%29.jpg",
      "subject": "Greenwich Village",
      "source": "https://commons.wikimedia.org/wiki/File:Greenwich_Village_(27483343909).jpg",
      "credit": "Felix Stahlberg",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Photograph_of_Fifth_Avenue_from_the_Metropolitan%E2%80%94New_York_City.jpg/960px-Photograph_of_Fifth_Avenue_from_the_Metropolitan%E2%80%94New_York_City.jpg",
      "subject": "Fifth Avenue",
      "source": "https://commons.wikimedia.org/wiki/File:Photograph_of_Fifth_Avenue_from_the_Metropolitan%E2%80%94New_York_City.jpg",
      "credit": "A. Balet",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg/960px-Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg",
      "subject": "Metropolitan Museum of Art",
      "source": "https://commons.wikimedia.org/wiki/File:Metropolitan_Museum_of_Art_(The_Met)_-_Central_Park,_NYC.jpg",
      "credit": "Hugo Schneider",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg",
      "subject": "Empire State Building",
      "source": "https://commons.wikimedia.org/wiki/File:Empire_State_Building_(aerial_view).jpg",
      "credit": "Sam Valadi",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Empire_State_Building_(aerial_view).jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/960px-New_york_times_square-terabass.jpg",
      "subject": "Times Square",
      "source": "https://commons.wikimedia.org/wiki/File:New_york_times_square-terabass.jpg",
      "credit": "Terabass",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/960px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg",
      "subject": "Manhattan",
      "source": "https://commons.wikimedia.org/wiki/File:View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_(cropped).jpg",
      "credit": "Dllu",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
  "悉尼": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/960px-Sydney_Australia._%2821339175489%29.jpg",
      "subject": "Sydney Opera House",
      "source": "https://commons.wikimedia.org/wiki/File:Sydney_Australia._(21339175489).jpg",
      "credit": "Bernard Spragg. NZ from Christchurch, New Zealand",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/North_view_of_Sydney_Opera_House%2C_the_Rocks_and_Sydney_CBD_20230223_1.jpg/960px-North_view_of_Sydney_Opera_House%2C_the_Rocks_and_Sydney_CBD_20230223_1.jpg",
      "subject": "Circular Quay",
      "source": "https://commons.wikimedia.org/wiki/File:North_view_of_Sydney_Opera_House,_the_Rocks_and_Sydney_CBD_20230223_1.jpg",
      "credit": "DXR",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Sydney_Harbour_Bridge-16_October_2025.jpg/960px-Sydney_Harbour_Bridge-16_October_2025.jpg",
      "subject": "Sydney Harbour Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:Sydney_Harbour_Bridge-16_October_2025.jpg",
      "credit": "Servite et contribuere",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Gates_at_Royal_Botanic_Gardens_viewed_from_Art_Gallery_Road.jpg/960px-Gates_at_Royal_Botanic_Gardens_viewed_from_Art_Gallery_Road.jpg",
      "subject": "Royal Botanic Garden, Sydney",
      "source": "https://commons.wikimedia.org/wiki/File:Gates_at_Royal_Botanic_Gardens_viewed_from_Art_Gallery_Road.jpg",
      "credit": "Bidgee",
      "license": "CC BY-SA 3.0 au",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/au/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Sydney_%28AU%29%2C_The_Rocks_--_2019_--_2133.jpg/960px-Sydney_%28AU%29%2C_The_Rocks_--_2019_--_2133.jpg",
      "subject": "The Rocks, New South Wales",
      "source": "https://commons.wikimedia.org/wiki/File:Sydney_(AU),_The_Rocks_--_2019_--_2133.jpg",
      "credit": "Dietmar Rabich",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Bondi_from_above.jpg/960px-Bondi_from_above.jpg",
      "subject": "Bondi Beach",
      "source": "https://commons.wikimedia.org/wiki/File:Bondi_from_above.jpg",
      "credit": "Nick Ang",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Art_Gallery_of_New_South_Wales%2C_2022%2C_09.jpg/960px-Art_Gallery_of_New_South_Wales%2C_2022%2C_09.jpg",
      "subject": "Art Gallery of New South Wales",
      "source": "https://commons.wikimedia.org/wiki/File:Art_Gallery_of_New_South_Wales,_2022,_09.jpg",
      "credit": "Chris Olszewski",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/2019-04-10_Sydney_CBD_view_from_Pyrmont_at_sunset.jpg/960px-2019-04-10_Sydney_CBD_view_from_Pyrmont_at_sunset.jpg",
      "subject": "Darling Harbour",
      "source": "https://commons.wikimedia.org/wiki/File:2019-04-10_Sydney_CBD_view_from_Pyrmont_at_sunset.jpg",
      "credit": "Maksym Kozlenko",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Summer_days_at_Manly_Beach.jpg/960px-Summer_days_at_Manly_Beach.jpg",
      "subject": "Manly Beach",
      "source": "https://commons.wikimedia.org/wiki/File:Summer_days_at_Manly_Beach.jpg",
      "credit": "Hardlinerr",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Sydney%28from_air%29_V2.jpg/960px-Sydney%28from_air%29_V2.jpg",
      "subject": "Port Jackson",
      "source": "https://commons.wikimedia.org/wiki/File:Sydney(from_air)_V2.jpg",
      "credit": "No machine-readable author provided. Merbabu~commonswiki assumed (based on copyright claims).",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Sydney(from_air)_V2.jpg"
    }
  ],
  "里约热内卢": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Praia_de_Copacabana_-_Rio_de_Janeiro%2C_Brasil.jpg/960px-Praia_de_Copacabana_-_Rio_de_Janeiro%2C_Brasil.jpg",
      "subject": "Copacabana, Rio de Janeiro",
      "source": "https://commons.wikimedia.org/wiki/File:Praia_de_Copacabana_-_Rio_de_Janeiro,_Brasil.jpg",
      "credit": "[www.flickr.com/photos/26912057@N02/ bisonlux]",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Ba%C3%ADa_de_Guanabara_vista_do_P%C3%A3o_de_A%C3%A7%C3%BAcar_2020.jpg/960px-Ba%C3%ADa_de_Guanabara_vista_do_P%C3%A3o_de_A%C3%A7%C3%BAcar_2020.jpg",
      "subject": "Guanabara Bay",
      "source": "https://commons.wikimedia.org/wiki/File:Ba%C3%ADa_de_Guanabara_vista_do_P%C3%A3o_de_A%C3%A7%C3%BAcar_2020.jpg",
      "credit": "Yeuxpapilon",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/P%C3%A3o_de_A%C3%A7ucar_-_Sugarloaf_Mountain_-_Zuckerhut_-_2022.jpg/960px-P%C3%A3o_de_A%C3%A7ucar_-_Sugarloaf_Mountain_-_Zuckerhut_-_2022.jpg",
      "subject": "Sugarloaf Mountain",
      "source": "https://commons.wikimedia.org/wiki/File:P%C3%A3o_de_A%C3%A7ucar_-_Sugarloaf_Mountain_-_Zuckerhut_-_2022.jpg",
      "credit": "Arne Müseler",
      "license": "CC BY-SA 3.0 de",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Aterro_do_Flamengo_visto_a_partir_do_morro_da_Urca.jpg/960px-Aterro_do_Flamengo_visto_a_partir_do_morro_da_Urca.jpg",
      "subject": "Flamengo Park",
      "source": "https://commons.wikimedia.org/wiki/File:Aterro_do_Flamengo_visto_a_partir_do_morro_da_Urca.jpg",
      "credit": "Pppires",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Santa_Teresa_center.jpg/960px-Santa_Teresa_center.jpg",
      "subject": "Santa Teresa, Rio de Janeiro",
      "source": "https://commons.wikimedia.org/wiki/File:Santa_Teresa_center.jpg",
      "credit": "Brooks patty",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Centro_do_Rio_de_Janeiro_by_Diego_Baravelli.jpg/960px-Centro_do_Rio_de_Janeiro_by_Diego_Baravelli.jpg",
      "subject": "Lapa, Rio de Janeiro",
      "source": "https://commons.wikimedia.org/wiki/File:Centro_do_Rio_de_Janeiro_by_Diego_Baravelli.jpg",
      "credit": "Diego Baravelli",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Museu_do_Amanh%C3%A3_rio.jpg/960px-Museu_do_Amanh%C3%A3_rio.jpg",
      "subject": "Museum of Tomorrow",
      "source": "https://commons.wikimedia.org/wiki/File:Museu_do_Amanh%C3%A3_rio.jpg",
      "credit": "Arne Müseler",
      "license": "CC BY-SA 3.0 de",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/960px-Christ_the_Redeemer_-_Cristo_Redentor.jpg",
      "subject": "Christ the Redeemer (statue)",
      "source": "https://commons.wikimedia.org/wiki/File:Christ_the_Redeemer_-_Cristo_Redentor.jpg",
      "credit": "Arne Müseler",
      "license": "CC BY-SA 3.0 de",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Forte_de_Copacabana_panorama.jpg/960px-Forte_de_Copacabana_panorama.jpg",
      "subject": "Ipanema",
      "source": "https://commons.wikimedia.org/wiki/File:Forte_de_Copacabana_panorama.jpg",
      "credit": "Gabriel Heusi/Brasil2016.gov.br",
      "license": "CC BY 3.0 br",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/br/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Enseada_de_Botafogo_e_P%C3%A3o_de_A%C3%A7%C3%BAcar.jpg/960px-Enseada_de_Botafogo_e_P%C3%A3o_de_A%C3%A7%C3%BAcar.jpg",
      "subject": "Botafogo",
      "source": "https://commons.wikimedia.org/wiki/File:Enseada_de_Botafogo_e_P%C3%A3o_de_A%C3%A7%C3%BAcar.jpg",
      "credit": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  ],
  "开罗": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Pyramids_of_the_Giza_Necropolis.jpg/960px-Pyramids_of_the_Giza_Necropolis.jpg",
      "subject": "Giza pyramid complex",
      "source": "https://commons.wikimedia.org/wiki/File:Pyramids_of_the_Giza_Necropolis.jpg",
      "credit": "KennyOMG",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Beautiful_nature_along_Nile_River_01.jpg/960px-Beautiful_nature_along_Nile_River_01.jpg",
      "subject": "Nile",
      "source": "https://commons.wikimedia.org/wiki/File:Beautiful_nature_along_Nile_River_01.jpg",
      "credit": "Fiktube",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Sphinx_with_the_third_pyramid.jpg/960px-Sphinx_with_the_third_pyramid.jpg",
      "subject": "Great Sphinx of Giza",
      "source": "https://commons.wikimedia.org/wiki/File:Sphinx_with_the_third_pyramid.jpg",
      "credit": "Hesham Ebaid",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Azhar_Park_Cairo_View.jpg/960px-Azhar_Park_Cairo_View.jpg",
      "subject": "Azhar Park Cairo View.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Azhar_Park_Cairo_View.jpg",
      "credit": "Yasser Nazmi",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Cairo%2C_Old_Cairo%2C_Hanging_Church%2C_Egypt%2C_Oct_2004_edit.jpg",
      "subject": "Old Cairo",
      "source": "https://commons.wikimedia.org/wiki/File:Cairo,_Old_Cairo,_Hanging_Church,_Egypt,_Oct_2004_edit.jpg",
      "credit": "Przemyslaw \"Blueshade\" Idzkiewicz derivative work: MrPanyGoff",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/%D8%AE%D8%A7%D9%86_%D8%A7%D9%84%D8%AE%D9%84%D9%8A%D9%84%D9%8A_1.jpg/960px-%D8%AE%D8%A7%D9%86_%D8%A7%D9%84%D8%AE%D9%84%D9%8A%D9%84%D9%8A_1.jpg",
      "subject": "Khan el-Khalili",
      "source": "https://commons.wikimedia.org/wiki/File:%D8%AE%D8%A7%D9%86_%D8%A7%D9%84%D8%AE%D9%84%D9%8A%D9%84%D9%8A_1.jpg",
      "credit": "Heba otefy",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/1897_bis_1902_wurde_das_%C3%84gyptische_Museum_in_Kairo_gebaut._04.jpg/960px-1897_bis_1902_wurde_das_%C3%84gyptische_Museum_in_Kairo_gebaut._04.jpg",
      "subject": "Egyptian Museum",
      "source": "https://commons.wikimedia.org/wiki/File:1897_bis_1902_wurde_das_%C3%84gyptische_Museum_in_Kairo_gebaut._04.jpg",
      "credit": "Holger Uwe Schmitt",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Cairo_Tower_%2814795997855%29.jpg/960px-Cairo_Tower_%2814795997855%29.jpg",
      "subject": "Cairo Tower",
      "source": "https://commons.wikimedia.org/wiki/File:Cairo_Tower_(14795997855).jpg",
      "credit": "Jorge Láscar from Melbourne, Australia",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Flickr_-_HuTect_ShOts_-_Citadel_of_Salah_El.Din_and_Masjid_Muhammad_Ali_%D9%82%D9%84%D8%B9%D8%A9_%D8%B5%D9%84%D8%A7%D8%AD_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%A7%D9%84%D8%A3%D9%8A%D9%88%D8%A8%D9%8A_%D9%88%D9%85%D8%B3%D8%AC%D8%AF_%D9%85%D8%AD%D9%85%D8%AF_%D8%B9%D9%84%D9%8A_-_Cairo_-_Egypt_-_17_04_2010_%284%29.jpg/960px-thumbnail.jpg",
      "subject": "Cairo Citadel",
      "source": "https://commons.wikimedia.org/wiki/File:Flickr_-_HuTect_ShOts_-_Citadel_of_Salah_El.Din_and_Masjid_Muhammad_Ali_%D9%82%D9%84%D8%B9%D8%A9_%D8%B5%D9%84%D8%A7%D8%AD_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%A7%D9%84%D8%A3%D9%8A%D9%88%D8%A8%D9%8A_%D9%88%D9%85%D8%B3%D8%AC%D8%AF_%D9%85%D8%AD%D9%85%D8%AF_%D8%B9%D9%84%D9%8A_-_Cairo_-_Egypt_-_17_04_2010_(4).jpg",
      "credit": "Ahmed Al.Badawy from Cairo, Egypt",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Kasr_Al_Nile_Bridge.JPG/960px-Kasr_Al_Nile_Bridge.JPG",
      "subject": "Qasr El Nil Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:Kasr_Al_Nile_Bridge.JPG",
      "credit": "Mohamed Amarochan",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  ],
  "曼谷": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg/960px-%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg",
      "subject": "Wat Arun",
      "source": "https://commons.wikimedia.org/wiki/File:%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg",
      "credit": "Mastertongapollo",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Chao_Phraya_River_-_Bangkok_-_northwards_-_from_King_Taksin_Bridge_-_2021.jpg/960px-Chao_Phraya_River_-_Bangkok_-_northwards_-_from_King_Taksin_Bridge_-_2021.jpg",
      "subject": "Chao Phraya River",
      "source": "https://commons.wikimedia.org/wiki/File:Chao_Phraya_River_-_Bangkok_-_northwards_-_from_King_Taksin_Bridge_-_2021.jpg",
      "credit": "This Photo was taken by Supanut Arunoprayote. Feel free to use any of my images, but please mention me as the author and may send me a message. (สามารถใช้ภาพได้อิสระ แต่กรุณาใส่เครดิตผู้ถ่ายและอาจส่งข้อความบอกกล่าวด้วย) Please do not upload an updated image here without consultation with the Author. The author would like to make corrections only at his own source. This ensures that the changes are preserved.Please if you think that any changes should be required, please inform the author.Otherwise you can upload a new image with a new name. Please use one of the templates derivative or extract.",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/0005574_-_Wat_Phra_Kaew_006.jpg/960px-0005574_-_Wat_Phra_Kaew_006.jpg",
      "subject": "Grand Palace",
      "source": "https://commons.wikimedia.org/wiki/File:0005574_-_Wat_Phra_Kaew_006.jpg",
      "credit": "Preecha.MJ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Aerial_view_of_Lumphini_Park.jpg/960px-Aerial_view_of_Lumphini_Park.jpg",
      "subject": "Lumphini Park",
      "source": "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Lumphini_Park.jpg",
      "credit": "Terence Ong",
      "license": "CC BY 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.5"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Charoen_Krung_Road_April2021_%E0%B8%96%E0%B8%99%E0%B8%99%E0%B9%80%E0%B8%88%E0%B8%A3%E0%B8%B4%E0%B8%8D%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87.jpg/960px-Charoen_Krung_Road_April2021_%E0%B8%96%E0%B8%99%E0%B8%99%E0%B9%80%E0%B8%88%E0%B8%A3%E0%B8%B4%E0%B8%8D%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87.jpg",
      "subject": "Charoen Krung Road",
      "source": "https://commons.wikimedia.org/wiki/File:Charoen_Krung_Road_April2021_%E0%B8%96%E0%B8%99%E0%B8%99%E0%B9%80%E0%B8%88%E0%B8%A3%E0%B8%B4%E0%B8%8D%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87.jpg",
      "credit": "Chainwit.",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/%282022%29_%E0%B8%95%E0%B8%B6%E0%B8%81%E0%B9%81%E0%B8%96%E0%B8%A7%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B8%96%E0%B8%99%E0%B8%99%E0%B9%80%E0%B8%A2%E0%B8%B2%E0%B8%A7%E0%B8%A3%E0%B8%B2%E0%B8%8A_%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%AA%E0%B8%B1%E0%B8%A1%E0%B8%9E%E0%B8%B1%E0%B8%99%E0%B8%98%E0%B8%A7%E0%B8%87%E0%B8%A8%E0%B9%8C_%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3_%284%29.jpg/960px-%282022%29_%E0%B8%95%E0%B8%B6%E0%B8%81%E0%B9%81%E0%B8%96%E0%B8%A7%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B8%96%E0%B8%99%E0%B8%99%E0%B9%80%E0%B8%A2%E0%B8%B2%E0%B8%A7%E0%B8%A3%E0%B8%B2%E0%B8%8A_%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%AA%E0%B8%B1%E0%B8%A1%E0%B8%9E%E0%B8%B1%E0%B8%99%E0%B8%98%E0%B8%A7%E0%B8%87%E0%B8%A8%E0%B9%8C_%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3_%284%29.jpg",
      "subject": "Yaowarat Road",
      "source": "https://commons.wikimedia.org/wiki/File:(2022)_%E0%B8%95%E0%B8%B6%E0%B8%81%E0%B9%81%E0%B8%96%E0%B8%A7%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B8%96%E0%B8%99%E0%B8%99%E0%B9%80%E0%B8%A2%E0%B8%B2%E0%B8%A7%E0%B8%A3%E0%B8%B2%E0%B8%8A_%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%AA%E0%B8%B1%E0%B8%A1%E0%B8%9E%E0%B8%B1%E0%B8%99%E0%B8%98%E0%B8%A7%E0%B8%87%E0%B8%A8%E0%B9%8C_%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3_(4).jpg",
      "credit": "กสิณธร ราชโอรส",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/BKK_Art_and_Culture_Centre_%28II%29.jpg/960px-BKK_Art_and_Culture_Centre_%28II%29.jpg",
      "subject": "Bangkok Art and Culture Centre",
      "source": "https://commons.wikimedia.org/wiki/File:BKK_Art_and_Culture_Centre_(II).jpg",
      "credit": "This Photo was taken by Supanut Arunoprayote. Feel free to use any of my images, but please mention me as the author and may send me a message. (สามารถใช้ภาพได้อิสระ แต่กรุณาใส่เครดิตผู้ถ่ายและอาจส่งข้อความบอกกล่าวด้วย) Please do not upload an updated image here without consultation with the Author. The author would like to make corrections only at his own source. This ensures that the changes are preserved.Please if you think that any changes should be required, please inform the author.Otherwise you can upload a new image with a new name. Please use one of the templates derivative or extract.",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Bangkok_-_King_Power_Mahanakhon_%E0%B8%84%E0%B8%B4%E0%B8%87_%E0%B9%80%E0%B8%9E%E0%B8%B2%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C_%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3_2021_May.jpg/960px-Bangkok_-_King_Power_Mahanakhon_%E0%B8%84%E0%B8%B4%E0%B8%87_%E0%B9%80%E0%B8%9E%E0%B8%B2%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C_%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3_2021_May.jpg",
      "subject": "King Power Mahanakhon",
      "source": "https://commons.wikimedia.org/wiki/File:Bangkok_-_King_Power_Mahanakhon_%E0%B8%84%E0%B8%B4%E0%B8%87_%E0%B9%80%E0%B8%9E%E0%B8%B2%E0%B9%80%E0%B8%A7%E0%B8%AD%E0%B8%A3%E0%B9%8C_%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3_2021_May.jpg",
      "credit": "Chainwit.",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/%E0%B8%AA%E0%B8%B0%E0%B8%9E%E0%B8%B2%E0%B8%99%E0%B8%9C%E0%B9%88%E0%B8%B2%E0%B8%99%E0%B8%9E%E0%B8%B4%E0%B8%A0%E0%B8%9E%E0%B8%A5%E0%B8%B5%E0%B8%A5%E0%B8%B2_April2021_Phanphiphop_Lila_02.jpg/960px-%E0%B8%AA%E0%B8%B0%E0%B8%9E%E0%B8%B2%E0%B8%99%E0%B8%9C%E0%B9%88%E0%B8%B2%E0%B8%99%E0%B8%9E%E0%B8%B4%E0%B8%A0%E0%B8%9E%E0%B8%A5%E0%B8%B5%E0%B8%A5%E0%B8%B2_April2021_Phanphiphop_Lila_02.jpg",
      "subject": "Rattanakosin Island",
      "source": "https://commons.wikimedia.org/wiki/File:%E0%B8%AA%E0%B8%B0%E0%B8%9E%E0%B8%B2%E0%B8%99%E0%B8%9C%E0%B9%88%E0%B8%B2%E0%B8%99%E0%B8%9E%E0%B8%B4%E0%B8%A0%E0%B8%9E%E0%B8%A5%E0%B8%B5%E0%B8%A5%E0%B8%B2_April2021_Phanphiphop_Lila_02.jpg",
      "credit": "Chainwit.",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Bangkok_-_Rama_VIII_Bridge_at_sunrise_Jan_2024.jpg/960px-Bangkok_-_Rama_VIII_Bridge_at_sunrise_Jan_2024.jpg",
      "subject": "Rama VIII Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:Bangkok_-_Rama_VIII_Bridge_at_sunrise_Jan_2024.jpg",
      "credit": "Dominic Nelson",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
  "孟买": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/960px-Mumbai_03-2016_30_Gateway_of_India.jpg",
      "subject": "Gateway of India",
      "source": "https://commons.wikimedia.org/wiki/File:Mumbai_03-2016_30_Gateway_of_India.jpg",
      "credit": "A.Savin",
      "license": "FAL",
      "licenseUrl": "http://artlibre.org/licence/lal/en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg/960px-Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg",
      "subject": "Marine Drive, Mumbai",
      "source": "https://commons.wikimedia.org/wiki/File:Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg",
      "credit": "A.Savin",
      "license": "FAL",
      "licenseUrl": "http://artlibre.org/licence/lal/en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Chhatrapati_shivaji_terminus%2C_esterno_01.jpg/960px-Chhatrapati_shivaji_terminus%2C_esterno_01.jpg",
      "subject": "Chhatrapati Shivaji Terminus",
      "source": "https://commons.wikimedia.org/wiki/File:Chhatrapati_shivaji_terminus,_esterno_01.jpg",
      "credit": "Sailko",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/4b/SGNP-Bombay.jpg",
      "subject": "Sanjay Gandhi National Park",
      "source": "https://commons.wikimedia.org/wiki/File:SGNP-Bombay.jpg",
      "credit": "上传者：Nichalp",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Colaba_panorama.jpg/960px-Colaba_panorama.jpg",
      "subject": "Colaba panorama.jpg",
      "source": "https://commons.wikimedia.org/wiki/File:Colaba_panorama.jpg",
      "credit": "Abhishek Modi",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Bandra_Worli_Sea_Link_at_night.jpg/960px-Bandra_Worli_Sea_Link_at_night.jpg",
      "subject": "Bandra",
      "source": "https://commons.wikimedia.org/wiki/File:Bandra_Worli_Sea_Link_at_night.jpg",
      "credit": "Navin Thakur",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Chhatrapati_Shivaji_Maharaj_Vastu_Sangrahalaya.jpg/960px-Chhatrapati_Shivaji_Maharaj_Vastu_Sangrahalaya.jpg",
      "subject": "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
      "source": "https://commons.wikimedia.org/wiki/File:Chhatrapati_Shivaji_Maharaj_Vastu_Sangrahalaya.jpg",
      "credit": "Anoop Ravi",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Bandra-Worli_Sealink_21.jpg/960px-Bandra-Worli_Sealink_21.jpg",
      "subject": "Worli",
      "source": "https://commons.wikimedia.org/wiki/File:Bandra-Worli_Sealink_21.jpg",
      "credit": "Devansh15",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Ganpati_Visarjan.jpg/960px-Ganpati_Visarjan.jpg",
      "subject": "Girgaon Chowpatty",
      "source": "https://commons.wikimedia.org/wiki/File:Ganpati_Visarjan.jpg",
      "credit": "Chris",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Bandra%E2%80%93Worli_Sea_Link.jpg/960px-Bandra%E2%80%93Worli_Sea_Link.jpg",
      "subject": "Bandra–Worli Sea Link",
      "source": "https://commons.wikimedia.org/wiki/File:Bandra%E2%80%93Worli_Sea_Link.jpg",
      "credit": "Streetsoda",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    }
  ],
  "新加坡": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Singapore_Merlion_BCT.jpg/960px-Singapore_Merlion_BCT.jpg",
      "subject": "Merlion Park",
      "source": "https://commons.wikimedia.org/wiki/File:Singapore_Merlion_BCT.jpg",
      "credit": "Bjørn Christian Tørrissen",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Marina_Bay_Singapore-3499.jpg/960px-Marina_Bay_Singapore-3499.jpg",
      "subject": "Marina Bay, Singapore",
      "source": "https://commons.wikimedia.org/wiki/File:Marina_Bay_Singapore-3499.jpg",
      "credit": "Bijay Chaurasia",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore_-_20120712-02.jpg/960px-Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore_-_20120712-02.jpg",
      "subject": "Gardens by the Bay",
      "source": "https://commons.wikimedia.org/wiki/File:Supertree_Grove,_Gardens_by_the_Bay,_Singapore_-_20120712-02.jpg",
      "credit": "Shiny Things.",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Symphony_Lake%2C_Singapore_Botanic_Gardens_-_20041025.jpg/960px-Symphony_Lake%2C_Singapore_Botanic_Gardens_-_20041025.jpg",
      "subject": "Singapore Botanic Gardens",
      "source": "https://commons.wikimedia.org/wiki/File:Symphony_Lake,_Singapore_Botanic_Gardens_-_20041025.jpg",
      "credit": "Velela",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Symphony_Lake,_Singapore_Botanic_Gardens_-_20041025.jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Aerial_perspective_of_Singapore%27s_Chinatown.jpg/960px-Aerial_perspective_of_Singapore%27s_Chinatown.jpg",
      "subject": "Chinatown, Singapore",
      "source": "https://commons.wikimedia.org/wiki/File:Aerial_perspective_of_Singapore%27s_Chinatown.jpg",
      "credit": "Bob Tan",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Kampong_Glam_aerial_shot_-_20250628_-_RSKY.jpg/960px-Kampong_Glam_aerial_shot_-_20250628_-_RSKY.jpg",
      "subject": "Kampong Glam",
      "source": "https://commons.wikimedia.org/wiki/File:Kampong_Glam_aerial_shot_-_20250628_-_RSKY.jpg",
      "credit": "Robert Sim",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Interior_of_the_National_Gallery_Singapore.jpg/960px-Interior_of_the_National_Gallery_Singapore.jpg",
      "subject": "National Gallery Singapore",
      "source": "https://commons.wikimedia.org/wiki/File:Interior_of_the_National_Gallery_Singapore.jpg",
      "credit": "Basile Morin",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Marina_Bay_Sands_%28I%29.jpg/960px-Marina_Bay_Sands_%28I%29.jpg",
      "subject": "Marina Bay Sands",
      "source": "https://commons.wikimedia.org/wiki/File:Marina_Bay_Sands_(I).jpg",
      "credit": "This Photo was taken by Supanut Arunoprayote. Feel free to use any of my images, but please mention me as the author and may send me a message. (สามารถใช้ภาพได้อิสระ แต่กรุณาใส่เครดิตผู้ถ่ายและอาจส่งข้อความบอกกล่าวด้วย) Please do not upload an updated image here without consultation with the Author. The author would like to make corrections only at his own source. This ensures that the changes are preserved.Please if you think that any changes should be required, please inform the author.Otherwise you can upload a new image with a new name. Please use one of the templates derivative or extract.",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/%28SGP-Singapore%29_East_Coast_Park_Zone_B_2026-01-25.jpg/960px-%28SGP-Singapore%29_East_Coast_Park_Zone_B_2026-01-25.jpg",
      "subject": "East Coast Park",
      "source": "https://commons.wikimedia.org/wiki/File:(SGP-Singapore)_East_Coast_Park_Zone_B_2026-01-25.jpg",
      "credit": "S5A-0043",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Double-Helix-Bridge.jpg/960px-Double-Helix-Bridge.jpg",
      "subject": "Helix Bridge",
      "source": "https://commons.wikimedia.org/wiki/File:Double-Helix-Bridge.jpg",
      "credit": "William Cho",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
    }
  ],
  "莫斯科": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Kremlin_and_Red_Square.1.jpg/960px-Kremlin_and_Red_Square.1.jpg",
      "subject": "Red Square",
      "source": "https://commons.wikimedia.org/wiki/File:Kremlin_and_Red_Square.1.jpg",
      "credit": "mos.ru",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Moskva_kremlin_04_2007.jpeg/960px-Moskva_kremlin_04_2007.jpeg",
      "subject": "Moskva (river)",
      "source": "https://commons.wikimedia.org/wiki/File:Moskva_kremlin_04_2007.jpeg",
      "credit": "Basile Starynkevitch",
      "license": "CC BY 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.5"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Saint_Basil%27s_Cathedral_in_Moscow.jpg/960px-Saint_Basil%27s_Cathedral_in_Moscow.jpg",
      "subject": "Saint Basil's Cathedral",
      "source": "https://commons.wikimedia.org/wiki/File:Saint_Basil%27s_Cathedral_in_Moscow.jpg",
      "credit": "Tsy1980",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Moscow_Gorky_Park_main_portal_08-2016_img1.jpg/960px-Moscow_Gorky_Park_main_portal_08-2016_img1.jpg",
      "subject": "Gorky Park (Moscow)",
      "source": "https://commons.wikimedia.org/wiki/File:Moscow_Gorky_Park_main_portal_08-2016_img1.jpg",
      "credit": "A.Savin",
      "license": "FAL",
      "licenseUrl": "http://artlibre.org/licence/lal/en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Arbat_Street_in_MSK.jpg/960px-Arbat_Street_in_MSK.jpg",
      "subject": "Arbat Street",
      "source": "https://commons.wikimedia.org/wiki/File:Arbat_Street_in_MSK.jpg",
      "credit": "Florstein (Telegram:WikiPhoto.Space)",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Zaryadye25.jpg/960px-Zaryadye25.jpg",
      "subject": "Zaryadye Park",
      "source": "https://commons.wikimedia.org/wiki/File:Zaryadye25.jpg",
      "credit": "mos.ru",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Gmii.jpg",
      "subject": "Pushkin Museum",
      "source": "https://commons.wikimedia.org/wiki/File:Gmii.jpg",
      "credit": "user:Ghirlandajo",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Moscow-City_2025.jpg/960px-Moscow-City_2025.jpg",
      "subject": "Moscow International Business Center",
      "source": "https://commons.wikimedia.org/wiki/File:Moscow-City_2025.jpg",
      "credit": "Igor3188",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Moscow_State_University.jpg/960px-Moscow_State_University.jpg",
      "subject": "Sparrow Hills",
      "source": "https://commons.wikimedia.org/wiki/File:Moscow_State_University.jpg",
      "credit": "Dmitry A. Mottl",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Krymsky_Val_-_Garden_Ring.jpg/960px-Krymsky_Val_-_Garden_Ring.jpg",
      "subject": "Garden Ring",
      "source": "https://commons.wikimedia.org/wiki/File:Krymsky_Val_-_Garden_Ring.jpg",
      "credit": "mos.ru",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    }
  ],
  "洛杉矶": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Griffith_observatory_2006.jpg/960px-Griffith_observatory_2006.jpg",
      "subject": "Griffith Observatory",
      "source": "https://commons.wikimedia.org/wiki/File:Griffith_observatory_2006.jpg",
      "credit": "Matthew Field",
      "license": "CC BY 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.5"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Santa_Monica_State_Beach.jpg/960px-Santa_Monica_State_Beach.jpg",
      "subject": "Santa Monica State Beach",
      "source": "https://commons.wikimedia.org/wiki/File:Santa_Monica_State_Beach.jpg",
      "credit": "Andrija12345678",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Hollywood_Bl_6100.JPG/960px-Hollywood_Bl_6100.JPG",
      "subject": "Hollywood Boulevard",
      "source": "https://commons.wikimedia.org/wiki/File:Hollywood_Bl_6100.JPG",
      "credit": "上传者：Yo shi",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Ferndell_griffith_park.jpg/960px-Ferndell_griffith_park.jpg",
      "subject": "Griffith Park",
      "source": "https://commons.wikimedia.org/wiki/File:Ferndell_griffith_park.jpg",
      "credit": "Amatullah Guyot",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Silver_Lake_Reservoir.jpg/960px-Silver_Lake_Reservoir.jpg",
      "subject": "Silver Lake, Los Angeles",
      "source": "https://commons.wikimedia.org/wiki/File:Silver_Lake_Reservoir.jpg",
      "credit": "Matsujima",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Artist_District%2C_Los_Angeles%2C_California%2C_05-29-2001.jpg",
      "subject": "Arts District, Los Angeles",
      "source": "https://commons.wikimedia.org/wiki/File:Artist_District,_Los_Angeles,_California,_05-29-2001.jpg",
      "credit": "The original uploader was Bobak at English Wikipedia.",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Aerial_Getty_Museum.jpg/960px-Aerial_Getty_Museum.jpg",
      "subject": "Getty Center",
      "source": "https://commons.wikimedia.org/wiki/File:Aerial_Getty_Museum.jpg",
      "credit": "Jelson25",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Aerial_Getty_Museum.jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Skyline_of_Los_Angeles%2C_Downtown_Los_Angeles%2C_California_13.jpg/960px-Skyline_of_Los_Angeles%2C_Downtown_Los_Angeles%2C_California_13.jpg",
      "subject": "Downtown Los Angeles",
      "source": "https://commons.wikimedia.org/wiki/File:Skyline_of_Los_Angeles,_Downtown_Los_Angeles,_California_13.jpg",
      "credit": "Levi Clancy",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/9b/Beach_bikepath_in_the_Venice_Beach_park%2C_California.jpg",
      "subject": "威尼斯 (洛杉矶)",
      "source": "https://commons.wikimedia.org/wiki/File:Beach_bikepath_in_the_Venice_Beach_park,_California.jpg",
      "credit": "上传者：SameerKhan~commonswiki",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Beach_bikepath_in_the_Venice_Beach_park,_California.jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Ca-1_between_Santa_Monica_and_LAX.JPG/960px-Ca-1_between_Santa_Monica_and_LAX.JPG",
      "subject": "California State Route 1",
      "source": "https://commons.wikimedia.org/wiki/File:Ca-1_between_Santa_Monica_and_LAX.JPG",
      "credit": "Fietsbel",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  ],
  "罗马": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg",
      "subject": "Colosseum",
      "source": "https://commons.wikimedia.org/wiki/File:Colosseo_2020.jpg",
      "credit": "FeaturedPics",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/PonteSantAngeloRom.jpg/960px-PonteSantAngeloRom.jpg",
      "subject": "Tiber",
      "source": "https://commons.wikimedia.org/wiki/File:PonteSantAngeloRom.jpg",
      "credit": "Rabax63",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Pantheon_%28Rome%29_-_Right_side_and_front.jpg/960px-Pantheon_%28Rome%29_-_Right_side_and_front.jpg",
      "subject": "Pantheon, Rome",
      "source": "https://commons.wikimedia.org/wiki/File:Pantheon_(Rome)_-_Right_side_and_front.jpg",
      "credit": "NikonZ7II",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Ingresso_monumentale_di_Villa_Borghese_a_Roma_su_piazzale_Flaminio_2018-02.jpg/960px-Ingresso_monumentale_di_Villa_Borghese_a_Roma_su_piazzale_Flaminio_2018-02.jpg",
      "subject": "Villa Borghese gardens",
      "source": "https://commons.wikimedia.org/wiki/File:Ingresso_monumentale_di_Villa_Borghese_a_Roma_su_piazzale_Flaminio_2018-02.jpg",
      "credit": "Oursana",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Santa_Maria_in_Trastevere_fountain.jpg/960px-Santa_Maria_in_Trastevere_fountain.jpg",
      "subject": "Trastevere",
      "source": "https://commons.wikimedia.org/wiki/File:Santa_Maria_in_Trastevere_fountain.jpg",
      "credit": "Jensens",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Santa_Maria_in_Trastevere_fountain.jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Piazza_Navona_%28Rome%29_at_night.jpg/960px-Piazza_Navona_%28Rome%29_at_night.jpg",
      "subject": "Piazza Navona",
      "source": "https://commons.wikimedia.org/wiki/File:Piazza_Navona_(Rome)_at_night.jpg",
      "credit": "NikonZ7II",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/0_Cordonata_-_Dioscuri_-_Palazzo_Senatorio.JPG/960px-0_Cordonata_-_Dioscuri_-_Palazzo_Senatorio.JPG",
      "subject": "Capitoline Museums",
      "source": "https://commons.wikimedia.org/wiki/File:0_Cordonata_-_Dioscuri_-_Palazzo_Senatorio.JPG",
      "credit": "Jean-Pol GRANDMONT",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/960px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg",
      "subject": "St. Peter's Basilica",
      "source": "https://commons.wikimedia.org/wiki/File:Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg",
      "credit": "Alvesgaspar",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Piazza_di_Spagna_%28Rome%29_0004.jpg/960px-Piazza_di_Spagna_%28Rome%29_0004.jpg",
      "subject": "Spanish Steps",
      "source": "https://commons.wikimedia.org/wiki/File:Piazza_di_Spagna_(Rome)_0004.jpg",
      "credit": "Arnaud 25",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Foro_Romano_Musei_Capitolini_Roma.jpg/960px-Foro_Romano_Musei_Capitolini_Roma.jpg",
      "subject": "Roman Forum",
      "source": "https://commons.wikimedia.org/wiki/File:Foro_Romano_Musei_Capitolini_Roma.jpg",
      "credit": "This Photo was taken by Wolfgang Moroder. Feel free to use my photos, but please mention me as the author and send me a message. This image is not in the public domain. Please respect the copyright protection. It may only be used according to the rules mentioned here. This specifically excludes use in social media, if applicable terms of the licenses listed here not appropriate. Please do not upload an updated image here without consultation with the Author. The author would like to make corrections only at his own source. This ensures that the changes are preserved.Please if you think that any changes should be required, please inform the author.Otherwise you can upload a new image with a new name. Please use one of the templates derivative or extract.",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  ],
  "迪拜": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg/960px-Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg",
      "subject": "Burj Khalifa",
      "source": "https://commons.wikimedia.org/wiki/File:Burj_Khalifa_(worlds_tallest_building)_and_the_Dubai_skyline_(25781049892).jpg",
      "credit": "imran shahabuddin",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Beach_%40_Jumeirah_Beach_Residence_%40_Dubai_Marina_%2815852332215%29.jpg/960px-Beach_%40_Jumeirah_Beach_Residence_%40_Dubai_Marina_%2815852332215%29.jpg",
      "subject": "Jumeirah Beach",
      "source": "https://commons.wikimedia.org/wiki/File:Beach_@_Jumeirah_Beach_Residence_@_Dubai_Marina_(15852332215).jpg",
      "credit": "Guilhem Vellut",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Museum_of_the_Future.jpg/960px-Museum_of_the_Future.jpg",
      "subject": "Museum of the Future",
      "source": "https://commons.wikimedia.org/wiki/File:Museum_of_the_Future.jpg",
      "credit": "Александр Сигачёв",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Downtown_Burj_Dubai_and_Business_Bay%2C_seen_from_Safa_Park.jpg/960px-Downtown_Burj_Dubai_and_Business_Bay%2C_seen_from_Safa_Park.jpg",
      "subject": "Safa Park",
      "source": "https://commons.wikimedia.org/wiki/File:Downtown_Burj_Dubai_and_Business_Bay,_seen_from_Safa_Park.jpg",
      "credit": "Robert Luxemburg",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Downtown_Burj_Dubai_and_Business_Bay,_seen_from_Safa_Park.jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Al_Bastakiya_of_Dubai.jpg/960px-Al_Bastakiya_of_Dubai.jpg",
      "subject": "Al Bastakiya",
      "source": "https://commons.wikimedia.org/wiki/File:Al_Bastakiya_of_Dubai.jpg",
      "credit": "Phil6007",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Dubai_Gold_Souk_on_31_May_2007_Pict_1.jpg/960px-Dubai_Gold_Souk_on_31_May_2007_Pict_1.jpg",
      "subject": "Dubai Gold Souk",
      "source": "https://commons.wikimedia.org/wiki/File:Dubai_Gold_Souk_on_31_May_2007_Pict_1.jpg",
      "credit": "Imre Solt",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Dubai_Design_District_View_of_Burj_Khalifa.jpg/960px-Dubai_Design_District_View_of_Burj_Khalifa.jpg",
      "subject": "Dubai Design District",
      "source": "https://commons.wikimedia.org/wiki/File:Dubai_Design_District_View_of_Burj_Khalifa.jpg",
      "credit": "Leakingh",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Dubai_Marina_Skyline.jpg/960px-Dubai_Marina_Skyline.jpg",
      "subject": "Dubai Marina",
      "source": "https://commons.wikimedia.org/wiki/File:Dubai_Marina_Skyline.jpg",
      "credit": "Norlando Pobre",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Artificial_Archipelagos%2C_Dubai%2C_United_Arab_Emirates_ISS022-E-024940_lrg_%28cropped%29.jpg/960px-Artificial_Archipelagos%2C_Dubai%2C_United_Arab_Emirates_ISS022-E-024940_lrg_%28cropped%29.jpg",
      "subject": "Palm Jumeirah",
      "source": "https://commons.wikimedia.org/wiki/File:Artificial_Archipelagos,_Dubai,_United_Arab_Emirates_ISS022-E-024940_lrg_(cropped).jpg",
      "credit": "Member of the Expedition 22 crew.",
      "license": "Public domain",
      "licenseUrl": "https://commons.wikimedia.org/wiki/File:Artificial_Archipelagos,_Dubai,_United_Arab_Emirates_ISS022-E-024940_lrg_(cropped).jpg"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/The_view_of_Dubai_Creek.jpg/960px-The_view_of_Dubai_Creek.jpg",
      "subject": "Dubai Creek",
      "source": "https://commons.wikimedia.org/wiki/File:The_view_of_Dubai_Creek.jpg",
      "credit": "Phil6007",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ],
  "柏林": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Brandenburger_Tor_abends.jpg/960px-Brandenburger_Tor_abends.jpg",
      "subject": "Brandenburg Gate",
      "source": "https://commons.wikimedia.org/wiki/File:Brandenburger_Tor_abends.jpg",
      "credit": "Thomas Wolf, www.foto-tw.de",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Berlin-_Bundestag_by_the_Spree_-_3570.jpg/960px-Berlin-_Bundestag_by_the_Spree_-_3570.jpg",
      "subject": "施普雷河",
      "source": "https://commons.wikimedia.org/wiki/File:Berlin-_Bundestag_by_the_Spree_-_3570.jpg",
      "credit": "Jorge Royan",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Berlin_Museumsinsel_Fernsehturm.jpg/960px-Berlin_Museumsinsel_Fernsehturm.jpg",
      "subject": "Museum Island",
      "source": "https://commons.wikimedia.org/wiki/File:Berlin_Museumsinsel_Fernsehturm.jpg",
      "credit": "Thomas Wolf, www.foto-tw.de",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/0/08/Berlin_Tiergarten_Siegess%C3%A4ule_Luftansicht.jpg",
      "subject": "Tiergarten (park)",
      "source": "https://commons.wikimedia.org/wiki/File:Berlin_Tiergarten_Siegess%C3%A4ule_Luftansicht.jpg",
      "credit": "beedubz",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Tempelhofer_Ufer_B-Kreuzberg_06-2017_img2.jpg/960px-Tempelhofer_Ufer_B-Kreuzberg_06-2017_img2.jpg",
      "subject": "Kreuzberg",
      "source": "https://commons.wikimedia.org/wiki/File:Tempelhofer_Ufer_B-Kreuzberg_06-2017_img2.jpg",
      "credit": "A.Savin",
      "license": "FAL",
      "licenseUrl": "http://artlibre.org/licence/lal/en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/Segment_with_Graffiti_of_the_Berlin_Wall_%283_of_4%29_%28cropped%29.jpg/960px-Segment_with_Graffiti_of_the_Berlin_Wall_%283_of_4%29_%28cropped%29.jpg",
      "subject": "East Side Gallery",
      "source": "https://commons.wikimedia.org/wiki/File:Segment_with_Graffiti_of_the_Berlin_Wall_(3_of_4)_(cropped).jpg",
      "credit": "Lklundin",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Berlin_Neue_Nationalgalerie_asv2021-11_img1.jpg/960px-Berlin_Neue_Nationalgalerie_asv2021-11_img1.jpg",
      "subject": "Neue Nationalgalerie",
      "source": "https://commons.wikimedia.org/wiki/File:Berlin_Neue_Nationalgalerie_asv2021-11_img1.jpg",
      "credit": "A.Savin",
      "license": "FAL",
      "licenseUrl": "http://artlibre.org/licence/lal/en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Berliner_Fernsehturm%2C_Sicht_vom_Neptunbrunnen_-_Berlin_Mitte.jpg/960px-Berliner_Fernsehturm%2C_Sicht_vom_Neptunbrunnen_-_Berlin_Mitte.jpg",
      "subject": "Fernsehturm Berlin",
      "source": "https://commons.wikimedia.org/wiki/File:Berliner_Fernsehturm,_Sicht_vom_Neptunbrunnen_-_Berlin_Mitte.jpg",
      "credit": "Christian Wolf (www.c-w-design.de)",
      "license": "CC BY-SA 3.0 de",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Tempelhofer_Feld_May_2021.jpg/960px-Tempelhofer_Feld_May_2021.jpg",
      "subject": "Tempelhofer Feld",
      "source": "https://commons.wikimedia.org/wiki/File:Tempelhofer_Feld_May_2021.jpg",
      "credit": "Coooohen",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/141227_Berliner_Dom.jpg/960px-141227_Berliner_Dom.jpg",
      "subject": "Berlin Cathedral",
      "source": "https://commons.wikimedia.org/wiki/File:141227_Berliner_Dom.jpg",
      "credit": "Ansgar Koreng",
      "license": "CC BY 3.0 de",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/de/deed.en"
    }
  ],
  "多伦多": [
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/CN_Tower_from_Puente_de_Luz%2C_Toronto%2C_Ontario%2C_2025-08-25_01.jpg/960px-CN_Tower_from_Puente_de_Luz%2C_Toronto%2C_Ontario%2C_2025-08-25_01.jpg",
      "subject": "CN Tower",
      "source": "https://commons.wikimedia.org/wiki/File:CN_Tower_from_Puente_de_Luz,_Toronto,_Ontario,_2025-08-25_01.jpg",
      "credit": "Chris Woodrich",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Marilyn_Bell_Park-Toronto.jpg/960px-Marilyn_Bell_Park-Toronto.jpg",
      "subject": "Lake Ontario",
      "source": "https://commons.wikimedia.org/wiki/File:Marilyn_Bell_Park-Toronto.jpg",
      "credit": "Mhsheikholeslami",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Gooderham.jpg/960px-Gooderham.jpg",
      "subject": "Distillery District",
      "source": "https://commons.wikimedia.org/wiki/File:Gooderham.jpg",
      "credit": "Geo Swan stitched by Marku1988 This image was created with Hugin.",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Hillside_Gardens_%2824677009128%29.jpg/960px-Hillside_Gardens_%2824677009128%29.jpg",
      "subject": "High Park",
      "source": "https://commons.wikimedia.org/wiki/File:Hillside_Gardens_(24677009128).jpg",
      "credit": "Jeff Hitchcock from Seattle, WA, USA",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Kensington_Market_Toronto_August_2017_01.jpg/960px-Kensington_Market_Toronto_August_2017_01.jpg",
      "subject": "Kensington Market",
      "source": "https://commons.wikimedia.org/wiki/File:Kensington_Market_Toronto_August_2017_01.jpg",
      "credit": "Arild Vågen",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Village_of_Yorkville_Park_%2837649654622%29.jpg/960px-Village_of_Yorkville_Park_%2837649654622%29.jpg",
      "subject": "Yorkville, Toronto",
      "source": "https://commons.wikimedia.org/wiki/File:Village_of_Yorkville_Park_(37649654622).jpg",
      "credit": "Jeff Hitchcock from Seattle, WA, USA",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Art_Gallery_of_Ontario_2023.jpg/960px-Art_Gallery_of_Ontario_2023.jpg",
      "subject": "Art Gallery of Ontario",
      "source": "https://commons.wikimedia.org/wiki/File:Art_Gallery_of_Ontario_2023.jpg",
      "credit": "Canmenwalker",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Toronto_August_2017_03.jpg/960px-Toronto_August_2017_03.jpg",
      "subject": "Financial District, Toronto",
      "source": "https://commons.wikimedia.org/wiki/File:Toronto_August_2017_03.jpg",
      "credit": "Arild Vågen",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Toronto_Islands_2025-05-08.jpg/960px-Toronto_Islands_2025-05-08.jpg",
      "subject": "Toronto Islands",
      "source": "https://commons.wikimedia.org/wiki/File:Toronto_Islands_2025-05-08.jpg",
      "credit": "JK Liu",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Toronto_-_ON_-_Toronto_Harbourfront_-_Amsterdam_Bridge.jpg/960px-Toronto_-_ON_-_Toronto_Harbourfront_-_Amsterdam_Bridge.jpg",
      "subject": "Harbourfront, Toronto",
      "source": "https://commons.wikimedia.org/wiki/File:Toronto_-_ON_-_Toronto_Harbourfront_-_Amsterdam_Bridge.jpg",
      "credit": "Wladyslaw",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
    }
  ]
};

export function getRouteCover(cityName: string, routeOrder: number): RouteCover | undefined {
  return ROUTE_COVERS[cityName]?.[routeOrder - 1];
}
