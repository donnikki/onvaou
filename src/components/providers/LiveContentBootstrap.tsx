import { PropsWithChildren, useEffect } from 'react';

import { liveContentService } from '@/src/services/supabase/contentSync';
import { useOfferStore } from '@/src/store/offerStore';
import { useShopStore } from '@/src/store/shopStore';

export function LiveContentBootstrap({ children }: PropsWithChildren) {
  const setShops = useShopStore((state) => state.setShops);
  const setOffers = useOfferStore((state) => state.setOffers);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        const next = await liveContentService.loadAll();
        if (!active) {
          return;
        }

        setShops(next.shops);
        setOffers(next.offers);
      } catch (error) {
        console.warn('Live content sync failed, keeping local data.', error);
      }
    };

    void sync();

    const unsubscribe = liveContentService.subscribe(() => {
      void sync();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setOffers, setShops]);

  return <>{children}</>;
}
