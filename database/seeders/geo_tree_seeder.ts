import { BaseSeeder } from '@adonisjs/lucid/seeders'

import City from '#models/city'
import Province from '#models/province'

export default class GeoTreeSeeder extends BaseSeeder {
  public static developmentOnly = true

  public async run() {
    const provinces = [
      {
        code: 'ID-JK',
        name: 'DKI Jakarta',
        cities: [
          { code: 'ID-JK-JP', name: 'Jakarta Pusat', classification: 'city' as const },
          { code: 'ID-JK-JU', name: 'Jakarta Utara', classification: 'city' as const },
          { code: 'ID-JK-JB', name: 'Jakarta Barat', classification: 'city' as const },
          { code: 'ID-JK-JS', name: 'Jakarta Selatan', classification: 'city' as const },
          { code: 'ID-JK-JT', name: 'Jakarta Timur', classification: 'city' as const },
        ],
      },
      {
        code: 'ID-JB',
        name: 'Jawa Barat',
        cities: [
          { code: 'ID-JB-BDG', name: 'Kota Bandung', classification: 'city' as const },
          { code: 'ID-JB-BKS', name: 'Kota Bekasi', classification: 'city' as const },
          { code: 'ID-JB-BGR', name: 'Kabupaten Bogor', classification: 'regency' as const },
          { code: 'ID-JB-CJR', name: 'Kabupaten Cianjur', classification: 'regency' as const },
        ],
      },
      {
        code: 'ID-JT',
        name: 'Jawa Tengah',
        cities: [
          { code: 'ID-JT-SMG', name: 'Kota Semarang', classification: 'city' as const },
          { code: 'ID-JT-SLO', name: 'Kota Surakarta', classification: 'city' as const },
          { code: 'ID-JT-MGL', name: 'Kabupaten Magelang', classification: 'regency' as const },
        ],
      },
      {
        code: 'ID-BT',
        name: 'Banten',
        cities: [
          { code: 'ID-BT-TNG', name: 'Kota Tangerang', classification: 'city' as const },
          { code: 'ID-BT-TGS', name: 'Kota Tangerang Selatan', classification: 'city' as const },
          { code: 'ID-BT-SRG', name: 'Kota Serang', classification: 'city' as const },
        ],
      },
    ]

    for (const provinceDef of provinces) {
      const province = await Province.updateOrCreate(
        { code: provinceDef.code },
        { name: provinceDef.name }
      )

      for (const cityDef of provinceDef.cities) {
        await City.updateOrCreate(
          { code: cityDef.code, provinceId: province.id },
          {
            name: cityDef.name,
            classification: cityDef.classification,
            provinceId: province.id,
          }
        )
      }
    }
  }
}
