<?php

namespace TeiEditionBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Validator\Constraints as Assert;

class ContactType
extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', EmailType::class, [
                'required' => true,
                'label' => 'Your E-Mail',
            ])
            ->add('subject', ChoiceType::class, [
                'label' => 'Subject',
                'choices' => [
                    'Error Report' => 'Error Report',
                    'Improvement' => 'Suggest an Improvement',
                    'Contact inquiry' => 'Contact inquiry',
                    'Other Reason' => 'Other Reason',
                ],
                'choice_translation_domain' => true,
            ])
            ->add('body', TextareaType::class, [
                'required' => true,
                'label' => 'Your Message',
            ])
            ->add('submit', SubmitType::class, [
                'label' => 'Send',
            ])
        ;
    }

    public function getName()
    {
        return 'contacttype';
    }
}
