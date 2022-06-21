import { useState } from 'react'
import labels from '../data/labels'
import { IonContent, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { Region, State, UserInfo } from '../data/types'

type Params = {
  id: string
}
const Help = () => {
  const params = useParams<Params>()
  const stateRegions = useSelector<State, Region[]>(state => state.regions)
  const stateUserInfo = useSelector<State, UserInfo | undefined>(state => state.userInfo)

  const [userRegion] = useState(() => stateRegions.find(r => r.id === stateUserInfo?.regionId))
  const [helpNote] = useState(() => {
    switch (params.id) {
      case 'o':
        return 'يمكنك تتبع مراحل تنفيذ طلبك من خلال خيار طلباتي من القائمة الجانبية في الصفحة الرئيسية، حيث تستطيع التعديل على الطلب أو إلغاؤه قبل بدء تنفيذه، كما يمكنك دمج الطلب مع الطلب الذي قبله ليتم تسلمهما معا'
      case 'ol':
        return 'سقف الطلبات الفعالة هو خمسون دينارا، ويمكنك طلب رفع هذه القيمة بالتواصل معنا'
      default:
        return ''
    }
  })
  const feesNote = 'رسوم الخدمة هي 1% من قيمة المشتريات، مضافا إليها رسوم التوصيل والتي تتحدد بناء على منطقتك'
  const regionFeesNote = 'حيث أن رسوم التوصيل ل'
  const ratingsNote = 'كذلك لا تنس تقييم المنتجات التي تشتريها حتى يستفيد الاخرون من تجربتك للمنتج، وذلك من خلال صفحة مشترياتي والتي يمكن الوصول اليها من القائمة الجانبية في الصفحة الرئيسية'
  const invitationsNote = ' وللحصول على المزيد من الخصومات لا تنس دعوة أصدقائك من خلال القائمة الجانبية في الصفحة الرئيسية حيث سوف تحصل على خصم لكل صديق يشترك معنا'
  return (
    <IonPage>
      <Header title={labels.helpPageTitle} />
      <IonContent fullscreen>
        <p className="note">{helpNote}</p>
        {params.id === 'o' &&
          <>
            <p className="help1">{feesNote}</p>
            {userRegion && userRegion.fees > 0 && <p className="help1">{`${regionFeesNote}${userRegion.name}: ${(userRegion.fees / 100).toFixed(2)}`}</p>}
            <p className="help2">{invitationsNote}</p>
            <p className="help2">{ratingsNote}</p>
          </>
        }
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Help