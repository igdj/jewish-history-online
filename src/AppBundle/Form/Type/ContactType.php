<?php

namespace AppBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints as Assert;

class ContactType
extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', 'email', [
                'required' => true,
                'label' => 'Your E-Mail',
            ])
            ->add('subject', 'choice', [
                'label' => 'Subject',
                'choices' => [
                    'Error Report' => 'Error Report',
                    'Improvement' => 'Suggest an Improvement',
                    'Contact inquiry' => 'Contact inquiry',
                    'Other Reason' => 'Other Reason',
                ],
                'choice_translation_domain' => true,
            ])
            ->add('body', 'textarea', [
                'required' => true,
                'label' => 'Your Message',
            ])
            ->add('submit', 'submit', [
                'label' => 'Send',
            ])
        ;
    }

    public function getName()
    {
        return 'contacttype';
    }
}
