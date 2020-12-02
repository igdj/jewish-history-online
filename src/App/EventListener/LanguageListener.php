<?php

/*
 * Show 404 in domain-dependant localization
 *
 * see http://donna-oberes.blogspot.de/2014/01/symfony-internalizationlocalization-and.html
 *
 * though we use the logic from
 * https://github.com/schmittjoh/JMSI18nRoutingBundle/blob/master/EventListener/LocaleChoosingListener.php
 *
 * register the listener in services.yml
 * services:
 *   # ...
 *
 *  # language-specific layout in 404
 *  app.language.kernel_request_listener:
 *      class: App\EventListener\LanguageListener
 *      arguments: [ '%jms_i18n_routing.default_locale%', '%jms_i18n_routing.locales%', '@jms_i18n_routing.locale_resolver' ]
 *      tags:
 *         - { name: kernel.event_listener, event: kernel.exception, method: setLocale }
 *
 */
namespace App\EventListener;

use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

use JMS\I18nRoutingBundle\Router\LocaleResolverInterface;

class LanguageListener
{
    protected $defaultLocale;
    protected $locales;
    protected $localeResolver;

    public function __construct($defaultLocale, array $locales, LocaleResolverInterface $localeResolver)
    {
        $this->defaultLocale = $defaultLocale;
        $this->locales = $locales;
        $this->localeResolver = $localeResolver;
    }

    public function setLocale(RequestEvent $event)
    {
        if (HttpKernelInterface::MASTER_REQUEST !== $event->getRequestType()) {
            return;
        }

        $request = $event->getRequest();

        $locale = $this->localeResolver->resolveLocale($request, $this->locales) ?: $this->defaultLocale;
        $request->setLocale($locale);
    }
}
