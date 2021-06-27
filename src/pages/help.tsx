import { useContext, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { Page, Navbar, Block, Icon, Toolbar } from 'framework7-react'
import labels from '../data/labels'
import BottomToolbar from './bottom-toolbar'

type Props = {
  id: string
}
const Help = (props: Props) => {
  const { state } = useContext(StateContext)
  const [userLocation] = useState(() => state.locations.find(l => l.id === state.userInfo?.locationId))
  const [helpNote] = useState(() => {
    switch (props.id) {
      case 'o':
        return 'يمكنك تتبع مراحل تنفيذ طلبك من خلال خيار طلباتي من القائمة الجانبية في الصفحة الرئيسية، حيث تستطيع التعديل على الطلب أو إلغاؤه قبل بدء تنفيذه، كما يمكنك دمج الطلب مع الطلب الذي قبله ليتم تسلمهما معا'
      case 'ol':
        return 'سقف الطلبات الفعالة هو خمسون دينارا، ويمكنك طلب رفع هذه القيمة بالتواصل معنا'
      default:
        return ''
    }
  })
  const feesNote = 'رسوم الخدمة هي 1% من قيمة المشتريات، مضافا إليها رسوم التوصيل والتي تتحدد بناء على منطقتك'
  const locationFeesNote = 'حيث أن رسوم التوصيل ل'
  const ratingsNote = 'كذلك لا تنس تقييم المنتجات التي تشتريها حتى يستفيد الاخرون من تجربتك للمنتج، وذلك من خلال صفحة مشترياتي والتي يمكن الوصول اليها من القائمة الجانبية في الصفحة الرئيسية'
  const invitationsNote = ' وللحصول على المزيد من الخصومات لا تنس دعوة أصدقائك من خلال القائمة الجانبية في الصفحة الرئيسية حيث سوف تحصل على خصم لكل صديق يشترك معنا'
  return (
    <Page>
      <Navbar title={labels.helpPageTitle} backLink={labels.back} />
      <Block strong inset className="center">
        <Icon color="red" material="warning"></Icon>
        <p className="note">{helpNote}</p>
        {props.id === 'o' &&
          <>
            <p className="help1">{feesNote}</p>
            {userLocation && userLocation.fees > 0 && <p className="help1">{`${locationFeesNote}${userLocation.name}: ${(userLocation.fees / 100).toFixed(2)}`}</p>}
            <p className="help2">{invitationsNote}</p>
            <p className="help2">{ratingsNote}</p>
          </>
        }
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Help