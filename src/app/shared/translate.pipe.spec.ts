import { TranslatePipe } from './translate.pipe';
import { BehaviorSubject } from 'rxjs';

describe('TranslatePipe', () => {
  it('calls translationService.translate and marks for check on translations change and unsubscribes on destroy', () => {
    const translations$ = new BehaviorSubject<any>({});
    const translationService = {
      translations$: translations$,
      translate: jasmine.createSpy('translate').and.returnValue('VALUE')
    } as any;
    const ref = { markForCheck: jasmine.createSpy('markForCheck') } as any;

    const pipe = new TranslatePipe(translationService, ref);

    // transform should call translate
    expect(pipe.transform('KEY')).toBe('VALUE');
    expect(translationService.translate).toHaveBeenCalledWith('KEY');

    // emitting should call markForCheck
    translations$.next({});
    expect(ref.markForCheck).toHaveBeenCalled();

    // ngOnDestroy should unsubscribe
    pipe.ngOnDestroy();
    ref.markForCheck.calls.reset();
    translations$.next({});
    expect(ref.markForCheck).not.toHaveBeenCalled();
  });
});
